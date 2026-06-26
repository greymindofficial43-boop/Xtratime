import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import { join, extname } from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

function generateCyberpunkSVG(w: number, h: number): string {
  const S = Math.max(w, 1280) / 1920;
  const b = 24 * S; 
  const pad = 12 * S + b / 2; 
  const L = pad;
  const R = w - pad;
  const T = pad;
  const B = h - pad;
  const cs = 80 * S; 

  const bottomBar = `
    <defs>
      <linearGradient id="bottomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#69D23F" />
        <stop offset="100%" stop-color="#F12B2B" />
      </linearGradient>
    </defs>
    <path d="M ${L + cs * 2} ${B} L ${R - cs * 2.5} ${B}" fill="none" stroke="url(#bottomGrad)" stroke-width="${b * 0.4}" />
  `;

  const createStripes = (x: number, y: number, color: string, dx: number, dy: number, count: number = 3) => {
    let stripes = '';
    const gap = 14 * S;
    const thick = 6 * S;
    for (let i = 0; i < count; i++) {
      const sx = x + i * gap;
      stripes += `<path d="M ${sx} ${y} L ${sx + dx} ${y + dy}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="round" />`;
    }
    return stripes;
  };

  return `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${L+cs} ${T} L ${R-cs} ${T} L ${R} ${T+cs} L ${R} ${B-cs} L ${R-cs} ${B} L ${L+cs} ${B} L ${L} ${B-cs} L ${L} ${T+cs} Z" fill="#000000" fill-rule="evenodd" />
      ${bottomBar}
      <path d="M ${L} ${T + cs * 1.7} L ${L} ${B - cs * 1.7}" stroke="rgba(255,255,255,0.3)" stroke-width="${b * 0.15}" />
      <path d="M ${R} ${T + cs * 1.7} L ${R} ${B - cs * 2.2}" stroke="rgba(255,255,255,0.3)" stroke-width="${b * 0.15}" />
      <path d="M ${L + cs * 1.7} ${T} L ${w / 2} ${T}" stroke="#69D23F" stroke-width="${b * 0.4}" />
      <path d="M ${w / 2} ${T} L ${R - cs * 1.7} ${T}" stroke="#F12B2B" stroke-width="${b * 0.4}" />
      <path d="M ${L + cs * 1.5} ${T} L ${L + cs} ${T} L ${L} ${T + cs} L ${L} ${T + cs * 1.5}" fill="none" stroke="#69D23F" stroke-width="${b}" stroke-linecap="square" stroke-linejoin="miter" />
      <path d="M ${R - cs * 1.5} ${T} L ${R - cs} ${T} L ${R} ${T + cs} L ${R} ${T + cs * 1.5}" fill="none" stroke="#F12B2B" stroke-width="${b}" stroke-linecap="square" stroke-linejoin="miter" />
      <path d="M ${L} ${B - cs * 1.5} L ${L} ${B - cs} L ${L + cs} ${B} L ${L + cs * 1.5} ${B}" fill="none" stroke="#69D23F" stroke-width="${b}" stroke-linecap="square" stroke-linejoin="miter" />
      <path d="M ${R} ${B - cs * 2} L ${R} ${B - cs} L ${R - cs} ${B} L ${R - cs * 2} ${B}" fill="none" stroke="#F12B2B" stroke-width="${b * 1.3}" stroke-linecap="square" stroke-linejoin="miter" />
      ${createStripes(L + cs * 1.8, T + 20 * S, '#69D23F', 15 * S, -30 * S)}
      ${createStripes(L + cs * 1.8, B - 10 * S, '#69D23F', 15 * S, -30 * S)}
      ${createStripes(R - cs * 3.5, B - 10 * S, '#F12B2B', 15 * S, -30 * S)}
    </svg>
  `;
}

async function saveToLocal(buffer: Buffer, originalname: string): Promise<{ localPath: string; localUrl: string }> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const ext = extname(originalname);
  const base = originalname.replace(/[^a-zA-Z0-9._-]/g, '_').replace(ext, '');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${base}${ext}`;
  const localPath = join(UPLOADS_DIR, filename);
  await fs.writeFile(localPath, buffer);
  const apiBase = (process.env.API_BASE_URL ?? '').replace(/\/$/, '');
  return { localPath, localUrl: `${apiBase}/uploads/${filename}` };
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^(image\/(jpeg|png|gif|webp|svg\+xml)|video\/(mp4|webm|ogg))$/)) {
          return cb(new BadRequestException('Only image and video files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    let finalBuffer = file.buffer;

    // Apply watermark and border if it's a static image (skip SVGs and animated GIFs)
    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg') && !file.mimetype.includes('gif')) {
      try {
        const metadata = await sharp(file.buffer).metadata();

        // 1. Enhance image clarity (sharpen and boost colors)
        let enhancedBuffer = await sharp(file.buffer)
          .sharpen({ sigma: 1.5 })
          .modulate({ brightness: 1.05, saturation: 1.1 })
          .toBuffer();

        const w = metadata.width || 1920;
        const h = metadata.height || 1080;
        const svgStr = generateCyberpunkSVG(w, h);
        const composites: any[] = [{ input: Buffer.from(svgStr), top: 0, left: 0 }];

        const logoName = process.env.WATERMARK_LOGO;
        if (logoName) {
          const logoPath = join(process.cwd(), '../../', logoName);
          try {
            // Large Centered Watermark
            const largeWidth = Math.round(w * 0.40);
            const largeLogoBuf = await sharp(logoPath).resize({ width: largeWidth }).toBuffer();
            const largeMetadata = await sharp(largeLogoBuf).metadata();
            const lH = largeMetadata.height || Math.round(largeWidth);
            const maskSVG = `<svg width="${largeWidth}" height="${lH}"><rect width="100%" height="100%" fill="rgba(255,255,255,0.10)"/></svg>`;
            const transparentLogo = await sharp(largeLogoBuf)
              .ensureAlpha()
              .composite([{ input: Buffer.from(maskSVG), blend: 'dest-in' }])
              .toBuffer();

            const largeTop = Math.max(0, Math.round(h / 2 - lH / 2 - h * 0.05));
            const largeLeft = Math.max(0, Math.round(w / 2 - largeWidth / 2));
            composites.push({ input: transparentLogo, top: largeTop, left: largeLeft });

            // Small Top-Right Watermark
            const smallWidth = Math.max(50, Math.round(w * 0.04));
            const smallLogoBuf = await sharp(logoPath).resize({ width: smallWidth }).toBuffer();
            const margin = 32;
            const smallTop = margin;
            const smallLeft = w - smallWidth - margin;
            composites.push({ input: smallLogoBuf, top: smallTop, left: smallLeft });
          } catch (logoErr) {
            console.warn(`Failed to apply watermark logos: ${logoErr.message}`);
          }
        }

        finalBuffer = await sharp(enhancedBuffer)
          .composite(composites)
          .webp({ quality: 90 }) // Use WebP for optimized size
          .toBuffer();
      } catch (err) {
        console.error('Image processing failed, using original buffer', err);
      }
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('Image upload is not configured on the server. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in production.');
      }
      const base64 = finalBuffer.toString('base64');
      return { url: `data:${file.mimetype};base64,${base64}` };
    }

    try {
      // Upload to Cloudinary
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'xtratime', resource_type: 'auto' },
          (error, res) => {
            if (error || !res) return reject(error ?? new Error('Upload failed'));
            resolve(res);
          },
        );
        stream.end(finalBuffer);
      });

      // Also save a local copy on the VPS filesystem
      let localPath: string | null = null;
      let localUrl: string | null = null;
      try {
        const local = await saveToLocal(finalBuffer, file.originalname);
        localPath = local.localPath;
        localUrl  = local.localUrl;
      } catch {
        // Local save failure must not block the upload — Cloudinary copy is the primary
      }

      await this.prisma.mediaFile.create({
        data: {
          url:       result.secure_url,
          publicId:  result.public_id,
          localUrl:  localUrl  ?? undefined,
          localPath: localPath ?? undefined,
          filename:  file.originalname,
          mimeType:  file.mimetype,
          size:      result.bytes ?? file.size ?? null,
          width:     result.width  ?? null,
          height:    result.height ?? null,
        },
      });

      return { url: result.secure_url, localUrl: localUrl ?? undefined };
    } catch {
      throw new InternalServerErrorException('Image upload failed');
    }
  }
}

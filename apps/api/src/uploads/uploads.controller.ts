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
  const S = Math.min(w, h) / 1080;
  const u = 12 * S; // Base unit for UI scaling (Increased slightly for thicker feel)

  // 1. The Absolute Boundary Cages (Solves the "image going outside" problem)
  // A slightly thicker black rim exactly at the edge of the canvas.
  const outerRim = `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#050505" stroke-width="${u*3.5}" />`;
  // Secondary dark grey structural track just inside the rim (adding subtle dark color layers)
  const innerTrack = `<rect x="${u*2.8}" y="${u*2.8}" width="${w - u*5.6}" height="${h - u*5.6}" fill="none" stroke="#1F1F1F" stroke-width="${u*1.2}" />`;

  // 2. Corner Bracket System (Intricate 90-degree UI corners)
  const cLen = u * 25; // Length of corner brackets

  const buildCorner = (color: string) => `
    <!-- Dark structural housing behind the neon to add tasteful black contrast -->
    <path d="M ${u*1.5} ${cLen*1.05} L ${u*1.5} ${u*1.5} L ${cLen*1.05} ${u*1.5}" fill="none" stroke="rgba(10,10,10,0.85)" stroke-width="${u*3}" stroke-linecap="square" stroke-linejoin="miter" />
    <!-- Thick main bracket sitting perfectly on the dark housing -->
    <path d="M ${u*1.8} ${cLen} L ${u*1.8} ${u*1.8} L ${cLen} ${u*1.8}" fill="none" stroke="${color}" stroke-width="${u*1.5}" stroke-linecap="square" stroke-linejoin="miter" />
    <!-- Fine detail inner HUD bracket -->
    <path d="M ${u*4.8} ${cLen*0.6} L ${u*4.8} ${u*4.8} L ${cLen*0.6} ${u*4.8}" fill="none" stroke="${color}" stroke-width="${u*0.4}" stroke-linecap="square" stroke-linejoin="miter" />
    <!-- Crosshair node -->
    <path d="M ${u*6.8} ${u*5.8} L ${u*6.8} ${u*7.5} M ${u*5.8} ${u*6.8} L ${u*7.5} ${u*6.8}" stroke="rgba(255,255,255,0.7)" stroke-width="${u*0.25}" />
    <!-- Tech data blocks on edges -->
    <rect x="${u*9}" y="${u*0.4}" width="${u*2}" height="${u*1}" fill="${color}" />
    <rect x="${u*11.5}" y="${u*0.4}" width="${u*0.8}" height="${u*1}" fill="rgba(255,255,255,0.9)" />
    <rect x="${u*0.4}" y="${u*11}" width="${u*1}" height="${u*2.5}" fill="${color}" />
  `;

  // Place corners precisely at the 4 bounds using mirroring
  const tl = `<g transform="translate(0, 0)">${buildCorner('#69D23F')}</g>`;
  const tr = `<g transform="translate(${w}, 0) scale(-1, 1)">${buildCorner('#F12B2B')}</g>`;
  const bl = `<g transform="translate(0, ${h}) scale(1, -1)">${buildCorner('#69D23F')}</g>`;
  const br = `<g transform="translate(${w}, ${h}) scale(-1, -1)">${buildCorner('#F12B2B')}</g>`;

  // 3. Telemetry / HUD Details along the edges
  const telemetryTop = `
    <g transform="translate(${w/2 - u*12}, ${u*3})">
      <rect x="0" y="0" width="${u*24}" height="${u*0.25}" fill="rgba(255,255,255,0.2)" />
      <rect x="0" y="${u*0.6}" width="${u*4}" height="${u*0.25}" fill="#F12B2B" />
      <rect x="${u*4.5}" y="${u*0.6}" width="${u*1.5}" height="${u*0.25}" fill="rgba(255,255,255,0.8)" />
      <rect x="${u*6.5}" y="${u*0.6}" width="${u*0.8}" height="${u*0.25}" fill="rgba(255,255,255,0.8)" />
      <rect x="${u*18}" y="${u*0.6}" width="${u*6}" height="${u*0.25}" fill="#69D23F" />
    </g>
  `;

  // 4. Central Bottom Segmented Data Bar
  const bottomBar = `
    <g transform="translate(${w/2 - u*15}, ${h - u*3.5})">
      <defs>
        <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#69D23F" />
          <stop offset="50%" stop-color="#FFDD00" />
          <stop offset="100%" stop-color="#F12B2B" />
        </linearGradient>
      </defs>
      <!-- Thick gradient bar -->
      <path d="M 0 0 L ${u*30} 0" fill="none" stroke="url(#cyberGrad)" stroke-width="${u*2}" />
      <!-- Black cuts for UI segmentation -->
      <path d="M ${u*6} -${u*1.2} L ${u*6} ${u*1.2} M ${u*15} -${u*1.2} L ${u*15} ${u*1.2} M ${u*24} -${u*1.2} L ${u*24} ${u*1.2}" fill="none" stroke="#050505" stroke-width="${u*1}" />
    </g>
  `;

  return `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <!-- Base Structural Cages -->
      ${outerRim}
      ${innerTrack}
      
      <!-- Telemetry Data Lines -->
      ${telemetryTop}
      
      <!-- 4-Corner Intricate Brackets -->
      ${tl}
      ${tr}
      ${bl}
      ${br}
      
      <!-- Central Bottom Energy Bar -->
      ${bottomBar}
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
        // 1. Fix EXIF orientation and enhance image clarity
        let enhancedBuffer = await sharp(file.buffer)
          .rotate() // Auto-orients based on EXIF tags
          .sharpen({ sigma: 1.5 })
          .modulate({ brightness: 1.05, saturation: 1.1 })
          .toBuffer();

        const metadata = await sharp(enhancedBuffer).metadata();
        const w = metadata.width || 1920;
        const h = metadata.height || 1080;
        
        const svgStr = generateCyberpunkSVG(w, h);
        const composites: any[] = [{ input: Buffer.from(svgStr), top: 0, left: 0 }];

        const S_local = Math.min(w, h) / 1080;
        const b_local = 24 * S_local;

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

            // Small Top-Right Watermark (Increased to 16% width as requested)
            const smallWidth = Math.max(80, Math.round(w * 0.16));
            const smallLogoBuf = await sharp(logoPath).resize({ width: smallWidth }).toBuffer();
            const margin = Math.round(32 * S_local);
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

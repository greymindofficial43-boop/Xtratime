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

    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
      try {
        let image = sharp(file.buffer);
        const metadata = await image.metadata();

        image = image.extend({
          top: 2, bottom: 2, left: 2, right: 2,
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        });

        const logoName = process.env.WATERMARK_LOGO;
        if (logoName) {
          const logoPath = join(process.cwd(), '../../', logoName);
          try {
            const watermarkWidth = Math.max(50, Math.round((metadata.width || 800) * 0.15));
            const padding = Math.max(5, Math.round(watermarkWidth * 0.05));
            const logoBuffer = await sharp(logoPath)
              .resize({ width: watermarkWidth })
              .extend({
                bottom: padding,
                right: padding,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .toBuffer();

            image = image.composite([{
              input: logoBuffer,
              gravity: 'southeast'
            }]);
          } catch (logoErr) {
            console.warn(`Failed to apply watermark logo: ${logoErr.message}`);
          }
        }
        finalBuffer = await image.toBuffer();
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

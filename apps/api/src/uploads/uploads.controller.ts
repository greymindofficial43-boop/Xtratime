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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('Image upload is not configured on the server. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in production.');
      }
      const base64 = file.buffer.toString('base64');
      return { url: `data:${file.mimetype};base64,${base64}` };
    }

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'xtratime', resource_type: 'auto' },
          (error, res) => {
            if (error || !res) return reject(error ?? new Error('Upload failed'));
            resolve(res);
          },
        );
        stream.end(file.buffer);
      });

      await this.prisma.mediaFile.create({
        data: {
          url:      result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          mimeType: file.mimetype,
          size:     result.bytes ?? file.size ?? null,
          width:    result.width  ?? null,
          height:   result.height ?? null,
        },
      });

      return { url: result.secure_url };
    } catch {
      throw new InternalServerErrorException('Image upload failed');
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    search?: string;
    mimeType?: string;
    page?: number;
    limit?: number;
  }) {
    const page  = Math.max(1, params.page  ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 40));
    const skip  = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.filename = { contains: params.search, mode: 'insensitive' };
    }
    if (params.mimeType) {
      where.mimeType = { startsWith: params.mimeType };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async remove(id: string) {
    const file = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Media file not found');

    if (file.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: file.mimeType.startsWith('video/') ? 'video' : 'image',
        });
      } catch {
        // Log but don't block deletion — the DB record should still be removed
      }
    }

    return this.prisma.mediaFile.delete({ where: { id } });
  }
}

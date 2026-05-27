import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  findAll(slotId?: string) {
    const where = slotId ? { slotId, isActive: true } : {};
    return this.prisma.advertisement.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  create(data: CreateAdDto) {
    return this.prisma.advertisement.create({ data });
  }

  async update(id: string, data: UpdateAdDto) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Advertisement not found');
    return this.prisma.advertisement.update({ where: { id }, data });
  }

  async remove(id: string) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Advertisement not found');
    return this.prisma.advertisement.delete({ where: { id } });
  }

  async recordView(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async recordClick(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }
}

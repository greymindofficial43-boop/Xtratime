import { Injectable } from '@nestjs/common';
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

  update(id: string, data: UpdateAdDto) {
    return this.prisma.advertisement.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.advertisement.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';

@Injectable()
export class PromosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.promo.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  create(dto: CreatePromoDto) {
    return this.prisma.promo.create({ data: dto });
  }

  async update(id: string, dto: UpdatePromoDto) {
    await this.ensureExists(id);
    return this.prisma.promo.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.promo.delete({ where: { id } });
  }

  reorder(updates: { id: string; sortOrder: number }[]) {
    return this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.promo.update({
          where: { id: u.id },
          data: { sortOrder: u.sortOrder },
        }),
      ),
    );
  }

  private async ensureExists(id: string) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo not found');
    return promo;
  }
}

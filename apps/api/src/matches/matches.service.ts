import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany({ orderBy: { date: 'asc' } });
  }

  create(data: CreateMatchDto) {
    return this.prisma.match.create({ data });
  }

  async update(id: string, data: UpdateMatchDto) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    return this.prisma.match.update({ where: { id }, data });
  }

  async remove(id: string) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    return this.prisma.match.delete({ where: { id } });
  }
}

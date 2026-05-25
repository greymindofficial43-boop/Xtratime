import { Injectable } from '@nestjs/common';
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

  update(id: string, data: UpdateMatchDto) {
    return this.prisma.match.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }
}

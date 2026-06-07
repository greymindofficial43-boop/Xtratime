import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Never return passwordHash to clients.
const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: PUBLIC_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with that email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role ?? UserRole.EDITOR,
      },
      select: PUBLIC_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Don't allow demoting the last remaining admin.
    if (dto.role && dto.role !== UserRole.ADMIN && user.role === UserRole.ADMIN) {
      await this.assertNotLastAdmin();
    }

    if (dto.email && dto.email !== user.email) {
      const dup = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (dup) throw new ConflictException('A user with that email already exists');
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.email) data.email = dto.email;
    if (dto.name) data.name = dto.name;
    if (dto.role) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({ where: { id }, data, select: PUBLIC_SELECT });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) await this.assertNotLastAdmin();

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException(
          'This user has authored articles. Reassign or remove their content first.',
        );
      }
      throw e;
    }
    return { ok: true };
  }

  private async assertNotLastAdmin() {
    const admins = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
    if (admins <= 1) {
      throw new BadRequestException('Cannot remove or demote the last admin');
    }
  }
}

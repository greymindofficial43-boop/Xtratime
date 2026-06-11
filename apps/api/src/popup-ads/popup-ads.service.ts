import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePopupAdDto } from './dto/create-popup-ad.dto';
import { UpdatePopupAdDto } from './dto/update-popup-ad.dto';

// Empty string / undefined leaves a date open (null).
function toDate(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}

@Injectable()
export class PopupAdsService {
  constructor(private readonly prisma: PrismaService) {}

  // All popups (admin view).
  findAll() {
    return this.prisma.popupAd.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // Popups that should be live right now: enabled and within the date window.
  findActive() {
    const now = new Date();
    return this.prisma.popupAd.findMany({
      where: {
        enabled: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(dto: CreatePopupAdDto) {
    return this.prisma.popupAd.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        openInNewTab: dto.openInNewTab,
        enabled: dto.enabled,
        sortOrder: dto.sortOrder,
        startDate: toDate(dto.startDate),
        endDate: toDate(dto.endDate),
      },
    });
  }

  async update(id: string, dto: UpdatePopupAdDto) {
    await this.ensureExists(id);
    const { startDate, endDate, ...rest } = dto;
    return this.prisma.popupAd.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate !== undefined ? { startDate: toDate(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: toDate(endDate) } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.popupAd.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const ad = await this.prisma.popupAd.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Popup ad not found');
    return ad;
  }
}

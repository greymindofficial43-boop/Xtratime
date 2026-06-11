import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PopupAdsService } from './popup-ads.service';
import { CreatePopupAdDto } from './dto/create-popup-ad.dto';
import { UpdatePopupAdDto } from './dto/update-popup-ad.dto';

@Controller('popup-ads')
export class PopupAdsController {
  constructor(private readonly popupAdsService: PopupAdsService) {}

  // Public: only the popups that are live right now (used by the site).
  @Get('active')
  findActive() {
    return this.popupAdsService.findActive();
  }

  // Admin list: every popup regardless of schedule/visibility.
  @Get()
  findAll() {
    return this.popupAdsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePopupAdDto) {
    return this.popupAdsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePopupAdDto) {
    return this.popupAdsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.popupAdsService.remove(id);
  }
}

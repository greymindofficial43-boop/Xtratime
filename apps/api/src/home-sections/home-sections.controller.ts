import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HomeSectionsService } from './home-sections.service';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';

@Controller('home-sections')
export class HomeSectionsController {
  constructor(private readonly homeSectionsService: HomeSectionsService) {}

  @Get()
  findAll() {
    return this.homeSectionsService.findAll();
  }

  @Post('seed-defaults')
  @UseGuards(JwtAuthGuard)
  seedDefaults() {
    return this.homeSectionsService.ensureSeeded();
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() body: { updates: { id: string; sortOrder: number }[] }) {
    return this.homeSectionsService.reorder(body.updates ?? []);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateHomeSectionDto) {
    return this.homeSectionsService.update(id, dto);
  }
}

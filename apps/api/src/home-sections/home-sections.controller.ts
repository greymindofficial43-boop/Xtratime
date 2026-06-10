import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HomeSectionsService } from './home-sections.service';
import { CreateHomeSectionDto } from './dto/create-home-section.dto';
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

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateHomeSectionDto) {
    return this.homeSectionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateHomeSectionDto) {
    return this.homeSectionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.homeSectionsService.remove(id);
  }
}

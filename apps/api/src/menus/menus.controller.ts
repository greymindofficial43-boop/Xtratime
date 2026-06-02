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
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  @Post('seed-defaults')
  @UseGuards(JwtAuthGuard)
  seedDefaults() {
    return this.menusService.seedDefaults();
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() body: { updates: { id: string; sortOrder: number }[] }) {
    return this.menusService.reorder(body.updates ?? []);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}

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
import { PromosService } from './promos.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';

@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get()
  findAll() {
    return this.promosService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePromoDto) {
    return this.promosService.create(dto);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() body: { updates: { id: string; sortOrder: number }[] }) {
    return this.promosService.reorder(body.updates ?? []);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePromoDto) {
    return this.promosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.promosService.remove(id);
  }
}

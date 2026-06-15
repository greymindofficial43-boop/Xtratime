import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll(
    @Query('search')   search?: string,
    @Query('mimeType') mimeType?: string,
    @Query('page')     page?: string,
    @Query('limit')    limit?: string,
  ) {
    return this.mediaService.findAll({
      search,
      mimeType,
      page:  page  ? parseInt(page,  10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}

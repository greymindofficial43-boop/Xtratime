import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import { BulkArticleActionDto } from './dto/bulk-article-action.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll({
      ...query,
      allStatuses: true,
    });
  }

  @Get('admin/trash')
  @UseGuards(JwtAuthGuard)
  findTrash(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll({
      ...query,
      allStatuses: true,
      trash: true,
    });
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string, @Query('preview') preview?: string) {
    const incrementView = preview !== 'true';
    return this.articlesService.findBySlug(slug, incrementView);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateArticleDto,
  ) {
    return this.articlesService.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Post('bulk/trash')
  @UseGuards(JwtAuthGuard)
  bulkTrash(@Body() dto: BulkArticleActionDto) {
    return this.articlesService.bulkRemove(dto.ids);
  }

  @Post('bulk/restore')
  @UseGuards(JwtAuthGuard)
  bulkRestore(@Body() dto: BulkArticleActionDto) {
    return this.articlesService.bulkRestore(dto.ids);
  }

  @Post('bulk/permanent-delete')
  @UseGuards(JwtAuthGuard)
  bulkPermanentDelete(@Body() dto: BulkArticleActionDto) {
    return this.articlesService.bulkPermanentRemove(dto.ids);
  }

  @Delete('trash/empty')
  @UseGuards(JwtAuthGuard)
  emptyTrash() {
    return this.articlesService.emptyTrash();
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.articlesService.restore(id);
  }

  // Soft delete — moves to trash (recoverable).
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }

  // Permanent delete — removes from the database for good.
  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard)
  permanentRemove(@Param('id') id: string) {
    return this.articlesService.permanentRemove(id);
  }
}

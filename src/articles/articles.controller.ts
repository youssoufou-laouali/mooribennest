import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(req.user.userId, createArticleDto);
  }

  @Public()
  @Get()
  findAll(@Query('take') take, @Query('skip') skip) {
    return this.articlesService.findAll({
      skip: parseInt(skip ?? '0'),
      take: parseInt(take ?? '20'),
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, req.user.userId, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.articlesService.remove(req.user.userId, id);
  }
}

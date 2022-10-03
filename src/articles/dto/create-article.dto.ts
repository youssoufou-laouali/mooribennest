import { Category } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsOptional()
  catgories: Category[];
}

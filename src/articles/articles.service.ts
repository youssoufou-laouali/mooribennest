import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async validateAdmin(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        role: {
          in: ['ADMIN', 'SUDO'],
        },
      },
    });

    if (!user) throw new HttpException('non authorisé', 401);
  }
  async create(userId: string, createArticleDto: CreateArticleDto) {
    await this.validateAdmin(userId);
    const article = await this.prisma.article.create({
      data: {
        categories: createArticleDto.categories,
        content: createArticleDto.content,
        description: createArticleDto.description,
        image: createArticleDto.image,
        name: createArticleDto.name,
        pdf: createArticleDto.pdf,
        pdfTitle: createArticleDto.pdfTitle,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return article;
  }

  async findAll({ skip, take }: { skip: number; take: number }) {
    const articles = await this.prisma.article.findMany({
      select: {
        categories: true,
        description: true,
        createdAt: true,
        id: true,
        image: true,
        name: true,
        updatedAt: true,
      },
      skip,
      take,
    });
    return articles;
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });
    return article;
  }

  async update(id: string, userId: string, updateArticleDto: UpdateArticleDto) {
    await this.validateAdmin(userId);
    const article = await this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
    return article;
  }

  async remove(userId: string, id: string) {
    await this.validateAdmin(userId);

    return await this.prisma.article.delete({
      where: { id },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}
  async create(dto: CreateFileDto, userId: string, name: string) {
    const users: {
      id: string;
    }[] = dto.users.map((user) => {
      return { id: user.id };
    });

    const data = await this.prisma.file.create({
      data: {
        isPrivate: !dto.isPublic,
        description: dto.description,
        users: {
          connect: users,
        },
        fichiers: JSON.stringify(dto.files),
        user: {
          connect: {
            id: userId,
          },
        },
        title: dto.title,
      },
    });
    let usersToSendEmail: any = dto.users;
    if (dto.isPublic) {
      usersToSendEmail = await this.prisma.user.findMany({
        where: {
          id: {
            not: userId,
          },
        },
      });
    }
    for (let index = 0; index < usersToSendEmail.length; index++) {
      for (let j = 0; j < dto.files.length; j++) {
        await this.mailService.sendFileShare(
          usersToSendEmail[index]?.email,
          name,
          dto.files[j].url,
        );
      }
    }
    // usersToSendEmail?.forEach((user) => {
    //   dto.files?.forEach((fichier) => {
    //     this.mailService.sendFileShare(user?.email, name, fichier.url);
    //   });
    // });

    return data;
  }

  async findAll(skip: number, orderBy, userId: string) {
    const totals = await this.prisma.file.count({
      where: {
        OR: [
          {
            users: {
              some: {
                id: userId,
              },
            },
          },
          {
            userId,
          },
          {
            isPrivate: false,
          },
        ],
      },
    });
    const files = await this.prisma.file.findMany({
      where: {
        OR: [
          {
            users: {
              some: {
                id: userId,
              },
            },
          },
          {
            userId,
          },
        ],
      },
      include: {
        users: {
          select: {
            id: true,
            image: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
      skip,
      take: 10,
    });
    return {
      totals,
      files,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}

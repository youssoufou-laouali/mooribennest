import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  async validateUser(adminId: string, userId: string) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id: adminId,
        role: {
          in: ['ADMIN', 'SUDO'],
        },
      },
    });

    if (!admin) throw new UnauthorizedException();

    const user = await this.findOne(userId);
    if (!user) throw new NotFoundError('utilisateur non trouvé');
    this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        active: true,
      },
    });
  }
}

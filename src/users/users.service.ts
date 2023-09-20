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

  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    const data = users?.map((user) => {
      const current = { ...user };
      delete current.password;
      return current;
    });
    return data;
  }
}

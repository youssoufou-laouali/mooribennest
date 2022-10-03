import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create_user.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  login(user: any) {
    const payload = { name: user.name, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: CreateUserDto) {
    const check_duplicate = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (check_duplicate) {
      throw new HttpException('utilisateur existe déjà', 409);
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(data.password, saltOrRounds);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hash,
        banner: '',
        description: '',
        image: '',
        name: data.name,
      },
    });

    const token = this.jwtService.sign({ id: user.id });
    await this.mailService.sendUserConfirmation(
      { email: user.email, name: user.name },
      token,
    );

    return await this.login(user);
  }

  async confirm(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new HttpException('non authorisé', 403);
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        verify: true,
      },
    });
    return {
      status: 200,
      data: {
        message: 'utilisateur confirmé',
      },
    };
  }
}

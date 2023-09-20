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

  login(user: { name: string; id: string }) {
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
        image: `https://ui-avatars.com/api/?name=${data.name.replace(
          ' ',
          '+',
        )}`,
        name: data.name,
      },
    });

    const token = this.jwtService.sign({ userId: user.id });
    await this.mailService.sendUserConfirmation(
      { email: user.email, name: user.name },
      token,
    );

    return {
      status: 201,
      message: "L'utilisateur est créer avec succéss",
    };
  }

  async confirm(token: string) {
    try {
      const payload: any = this.jwtService.decode(token);
      const { userId, exp } = payload;
      if (Date.now() >= exp * 1000) {
        throw new HttpException('le token a expiré', 403);
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId ?? '',
        },
      });

      if (!user) throw new HttpException("cet utilisateur n'existe pas ", 404);
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verify: true,
          active: true,
        },
      });
      const access_token = await this.login({
        name: user.name,
        id: user.id,
      });
      return {
        status: 200,
        message: 'votre adresse email est vérifié',
        access_token,
      };
    } catch (error) {
      throw new HttpException(
        'Une erreur est survenue lors de votre rêquette',
        500,
      );
    }
  }
}

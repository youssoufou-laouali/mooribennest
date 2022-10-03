import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(
    user: { email: string; name: string },
    token: string,
  ) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      //   to: 'youssoufouissi@gmail.com',
      subject: 'Bonjour ! Confirmer votre email',
      template: './confirmation',
      context: {
        name: user.name,
        url,
      },
    });
  }
}

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(
    user: { email: string; name: string },
    token: string,
  ) {
    //TODO: Add the frontend email
    const url = `example.com/auth/confirm?token=${token}`;

    this.mailerService.sendMail({
      to: user.email,
      subject: `Bonjour ${user.name}! Confirmer votre email`,
      template: './confirmation',
      context: {
        name: user.name,
        url,
      },
    });
  }
}

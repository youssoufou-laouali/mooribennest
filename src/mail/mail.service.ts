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
    const url = `https://mooriben.vercel.app/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Bonjour ${user.name}! Confirmer votre email`,
      template: './confirmation',
      context: {
        name: user.name,
        url,
      },
    });
  }

  async sendFileShare(email: string, username: string, fileUrl: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `${username} vient de partager un nouveau fichier`,
      template: './promotional',
      context: {
        username,
        fileUrl,
      },
    });
  }
}

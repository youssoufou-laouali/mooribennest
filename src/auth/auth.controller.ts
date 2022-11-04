import {
  Controller,
  Post,
  Body,
  HttpException,
  Get,
  Query,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '../users/dto/create_user.dto';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('auth/login')
  async login(@Body() data: LoginUserDto) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) throw new HttpException('Credentials incorrectes', 401);
    return this.authService.login(user);
  }
  @Public()
  @Post('auth/register')
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @Public()
  @Post('auth/confirm')
  async confirm(@Query('token') token: string) {
    return this.authService.confirm(token);
  }
}

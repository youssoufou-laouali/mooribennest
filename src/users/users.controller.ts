import { Controller, Get, Request, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@Request() req) {
    const user = await this.usersService.findOne(req.user);
    const { password, ...rest } = user;
    return rest;
  }

  @Post('active/:userId')
  async activeUser(@Query('userId') userId: string, @Request() req) {
    return await this.usersService.validateUser(req.user, userId);
  }
}

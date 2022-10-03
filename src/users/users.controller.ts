import { Controller, Get, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@Request() req) {
    const user = await this.usersService.findOne(req.user);
    const { password, ...rest } = user;
    return rest;
  }
}

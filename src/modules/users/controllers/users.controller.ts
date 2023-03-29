import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor() {}

  @Get()
  async hello() {
    return 'HELLO';
  }
}

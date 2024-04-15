import { JwtStrategy } from './../../common/auth/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { CustomerController } from './controllers/customer.controller';
import { PrismaService } from './../prisma/services/prisma.service';
import { CustomerService } from './services/customer.service';
import { Module } from '@nestjs/common';
import { EmailNotificationService } from '@modules/notifications/services/email-notification.service';

@Module({
  controllers: [CustomerController],
  providers: [
    JwtService,
    CustomerService,
    PrismaService,
    EmailNotificationService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}

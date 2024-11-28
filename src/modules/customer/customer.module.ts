import { EmailNotificationService } from '@modules/notifications/services/email-notification.service';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/services/prisma.service';
import { CustomerController } from './controllers/customer.controller';
import { EmployeeController } from './controllers/employee.controller';
import { CustomerService } from './services/customer.service';
import { EmployeeService } from './services/employee.service';
// import { CacheService } from '@modules/cache/services/cache.service';

@Module({
  controllers: [CustomerController, EmployeeController],
  providers: [
    JwtService,
    CustomerService,
    PrismaService,
    EmailNotificationService,
    EmployeeService,
    // CacheService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}

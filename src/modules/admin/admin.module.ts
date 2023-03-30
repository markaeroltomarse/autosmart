import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from './../prisma/prisma.module';
import { AdminService } from '@modules/admin/services/admin.service';
import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, JwtService],
  exports: [AdminService],
})
export class AdminModule {}

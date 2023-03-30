import { JWT_SECRET } from '@common/environment';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAdminInput } from '../dto/input/create-admin.input';
import { BadRequestException } from '@nestjs/common/exceptions';
import { GeneratorProvider } from '@common/providers/generator.provider';
import { AdminLoginInput } from '../dto/input/login-admin.input';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getAdmin(adminId: string) {
    return this.prismaService.adminEntity
      .findFirst({
        where: {
          id: adminId,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new UnauthorizedException();
      });
  }

  async createAdmin(adminInput: CreateAdminInput) {
    // check if email is exist
    const admin = await this.prismaService.adminEntity.findFirst({
      where: {
        email: adminInput.email,
      },
    });

    if (admin) throw new BadRequestException('Email already exist.');

    // Save new admin
    const savedAdmin = await this.prismaService.adminEntity
      .create({
        data: {
          ...adminInput,
          // Encrypt Password
          password: GeneratorProvider.generateHash(adminInput.password),
        },
      })
      .catch((error) => {
        // Catch insertion error
        console.log(error);
        throw new BadRequestException(`Cannot create admin. Please try again.`);
      });

    // return new admin
    return savedAdmin;
  }

  async loginAdmin(loginInput: AdminLoginInput) {
    const admin = await this.prismaService.adminEntity.findFirst({
      where: {
        email: loginInput.email,
      },
    });

    // Check if invalid login
    if (
      !admin ||
      !GeneratorProvider.validateHash(loginInput.password, admin.password) //  Decrypt password and check if match
    ) {
      throw new BadRequestException('Invalid credentials. Please try again.');
    }

    // Create a token that will handle in Front End. for security
    const token = this.jwtService.sign(
      { id: admin.id },
      {
        secret: JWT_SECRET,
      },
    );

    return {
      admin,
      token,
    };
  }
}

import { PrismaService } from './../../../modules/prisma/services/prisma.service';
import { JWT_SECRET } from '@common/environment';
import { AdminService } from '@modules/admin/services/admin.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interface/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      secretOrKey: JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const admin = await this.prismaService.adminEntity.findFirst({
        where: { id: payload.id },
      });

      const customer = await this.prismaService.customerEntity.findFirst({
        where: {
          id: payload.id,
        },
      });

      const user = admin || customer;

      if (!user) throw new UnauthorizedException();

      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

// import { JWT_SECRET } from '@common/environment';
// import { AdminService } from '@modules/admin/services/admin.service';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { JwtPayload } from '../interface/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly adminService: AdminService) {
//     super({
//       secretOrKey: JWT_SECRET,
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     });
//   }

//   async validate(payload: JwtPayload) {
//     try {
//       const admin = await this.adminService.getAdminById(payload.id);
//       if (!admin) throw new UnauthorizedException();

//       return admin;
//     } catch (e) {
//       throw new UnauthorizedException();
//     }
//   }
// }

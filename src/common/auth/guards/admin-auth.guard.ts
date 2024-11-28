import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }

  handleRequest(error, user, info) {
    if (error || !user || user?.role !== 'admin') {
      console.log(user);
      throw error || new UnauthorizedException();
    }

    return user;
  }
}

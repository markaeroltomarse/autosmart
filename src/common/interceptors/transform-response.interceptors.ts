import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class TransformResponse implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((result: { message: string; data: any }) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: result.message || 'success',
        data: result.data,
      })),
    );
  }
}

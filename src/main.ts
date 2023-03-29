import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module';
import corsConfig from '@config/cors.config';
import { APP_PORT } from '@common/environment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.enableCors(corsConfig);
  await app.listen(APP_PORT, '0.0.0.0').then(async () => {
    Logger.log(
      `✅  Application is running on: ${await app.getUrl()}`,
      'NestJS',
    );
  });
}
bootstrap();

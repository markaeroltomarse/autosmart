import { JwtStrategy } from './../common/auth/strategy/jwt.strategy';
import { JWT_SECRET } from '@common/environment';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { CustomerModule } from './customer/customer.module';
import { TransactionModule } from './transaction/transaction.module';
import { NotificationsModule } from './notifications/notifications.module';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '..', '/lang/'),
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: JWT_SECRET,
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
    AdminModule,
    CustomerModule,
    PrismaModule,
    ProductModule,
    CartModule,
    TransactionModule,
    NotificationsModule,
    // CacheableModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}

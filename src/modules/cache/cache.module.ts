// import {
//   BadRequestException,
//   CACHE_MANAGER,
//   CacheModule,
//   CacheStore,
//   Inject,
//   Module,
// } from '@nestjs/common';
// import { Cache } from 'cache-manager';
// import { redisStore } from 'cache-manager-redis-store';
// import { CacheService } from './services/cache.service';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as moment from 'moment';
// import {
//   EMAIL_EXPIRATION_TO_SEND_SECONDS,
//   EMAIL_VERIFICATION_KEY_SUFFIX,
// } from './config/cache.config';
// import { IEmailVerificationRequestJson } from './interfaces/cache.interface';

// let cache: Cache;

// @Module({
//   imports: [
//     CacheModule.registerAsync({
//       isGlobal: true,
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => {
//         return {
//           store: (await redisStore({
//             socket: {
//               host: configService.get('REDIS_HOST'),
//               port: configService.get('REDIS_PORT'),
//             },
//             username: configService.get('REDIS_USERNAME'),
//             password: configService.get('REDIS_PASSWORD'),
//             ttl: EMAIL_EXPIRATION_TO_SEND_SECONDS,
//           })) as unknown as CacheStore,
//         };
//       },
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [CacheService],
//   exports: [CacheService],
// })
// export class CacheableModule {
//   constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
//     cache = cacheManager;
//   }
// }

// export const CacheEmailExpiration = (
//   target: any,
//   propertyKey: string,
//   descriptor: PropertyDescriptor,
// ) => {
//   const originalMethod = descriptor.value;
//   descriptor.value = async function (...args: any[]) {
//     const cacheKey: string = EMAIL_VERIFICATION_KEY_SUFFIX + args[0];
//     const cachedData: IEmailVerificationRequestJson = await cache.get(cacheKey);

//     if (cachedData) {
//       throw new BadRequestException(
//         'Cannot request account verification please wait few moments.',
//       );
//     } else {
//       const EXPIRATION: string = moment().add(1, 'minutes').utc().format();
//       await cache.set(
//         cacheKey,
//         {
//           expiration: EXPIRATION,
//         },
//         EMAIL_EXPIRATION_TO_SEND_SECONDS, // Set TTL to 1 minute (60 seconds)
//       );
//     }

//     return originalMethod.apply(this, args);
//   };
// };

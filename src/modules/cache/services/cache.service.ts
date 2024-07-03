import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  EMAIL_EXPIRATION_TO_SEND_SECONDS,
  EMAIL_VERIFICATION_KEY_SUFFIX,
} from '../config/cache.config';
import { IEmailVerificationRequestJson } from '../interfaces/cache.interface';
import * as moment from 'moment';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async clearCache() {
    return this.cacheManager.reset();
  }

  async getEmailVerificationExpirationByCustomerId(customerId: string) {
    const cacheKey = EMAIL_VERIFICATION_KEY_SUFFIX + customerId;
    const customerEmailCache: IEmailVerificationRequestJson =
      await this.cacheManager.store.get(cacheKey);

    console.log('customerEmailCache', customerEmailCache);
  }

  async checkAccountVerificationEmailRequest(customerId: string) {
    const cacheKey: string = EMAIL_VERIFICATION_KEY_SUFFIX + customerId;
    const cachedData: IEmailVerificationRequestJson =
      await this.cacheManager.get(cacheKey);

    if (cachedData) {
      throw new BadRequestException(
        'Cannot request account verification please wait few moments.',
      );
    } else {
      const EXPIRATION: string = moment().add(1, 'minutes').utc().format();
      await this.cacheManager.set(
        cacheKey,
        {
          expiration: EXPIRATION,
        },
        EMAIL_EXPIRATION_TO_SEND_SECONDS, // Set TTL to 1 minute (60 seconds)
      );
    }
  }
}

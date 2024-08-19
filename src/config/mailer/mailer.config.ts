import {
  MAILER_HOST,
  MAILER_PASSWORD,
  MAILER_PORT,
  MAILER_SECURE,
  MAILER_USER,
} from '@common/environment';
import { MailerOptions } from '@nestjs-modules/mailer';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

export const mailerAsyncConfig: MailerAsyncOptions = {
  useFactory: async (): Promise<MailerOptions> => {
    return {
      transport: {
        host: MAILER_HOST,
        port: Number(MAILER_PORT),
        secure: MAILER_SECURE === 'true',
        auth: {
          user: MAILER_USER,
          pass: MAILER_PASSWORD,
        },
      },
    };
  },
};

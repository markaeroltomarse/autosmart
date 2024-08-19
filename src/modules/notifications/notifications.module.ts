import { mailerAsyncConfig } from '@config/mailer/mailer.config';
import { NotificationServices } from '@modules/notifications/services';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [MailerModule.forRootAsync(mailerAsyncConfig)],
  providers: [...NotificationServices],
  exports: [...NotificationServices],
})
export class NotificationsModule {}

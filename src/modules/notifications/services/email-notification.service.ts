import { EMAIL_NOTIFICATION_FROM } from '@common/environment';

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { promisify } from 'util';
import { I18nService } from 'nestjs-i18n';
import { SendEmailInput, SendMultipleEmailInput } from '../dtos/inputs';

@Injectable()
export class EmailNotificationService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly i18n: I18nService,
  ) {}

  async sendEmail(
    sendEmailInput: SendEmailInput,
    replacements: Record<string, unknown>,
  ) {
    const { emailRecipient, emailTemplate, emailSubject, attachments } =
      sendEmailInput;

    const readFile = promisify(fs.readFile);
    const html = await readFile(
      `dist/modules/notifications/dtos/templates/${emailTemplate}`,
      'utf8',
    );

    const context = { ...replacements };

    const template = handlebars.compile(html);
    const htmlToSend = template(context);
    await this.mailerService
      .sendMail({
        to: emailRecipient,
        from: EMAIL_NOTIFICATION_FROM,
        subject: emailSubject,
        html: htmlToSend,
        attachments: attachments,
      })
      .catch(async (error) => {
        console.log(error);
        throw new UnprocessableEntityException(
          await this.i18n.translate(
            'notification.EMAIL_NOTIFICATION.SENDING_EMAIL_FAILED',
          ),
        );
      });
  }

  async sendMultipleEmail(
    sendMultipleEmailInput: SendMultipleEmailInput,
    replacements: Record<string, unknown>,
  ) {
    const {
      emailRecipients,
      emailTemplate,
      emailSubject,
      attachments,
      mainRecipients,
    } = sendMultipleEmailInput;

    const readFile = promisify(fs.readFile);
    const html = await readFile(
      `dist/modules/notifications/dtos/templates/${emailTemplate}`,
      'utf8',
    );
    const context = { ...replacements };
    const template = handlebars.compile(html);
    const htmlToSend = template(context);
    await this.mailerService
      .sendMail({
        to: mainRecipients,
        bcc: emailRecipients,
        from: 'playfriendsgg@eden.com',
        subject: emailSubject,
        html: htmlToSend,
        attachments: attachments,
      })
      .then(() => {
        return;
      })
      .catch(async (error) => {
        console.log(error);
        throw new UnprocessableEntityException(
          await this.i18n.translate(
            'notification.EMAIL_NOTIFICATION.SENDING_EMAIL_FAILED',
          ),
        );
      });
  }
}

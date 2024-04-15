import { AttachmentInput } from '@modules/notifications/dtos/inputs/attachment.input';

export class SendEmailInput {
  emailRecipient: string;
  emailTemplate: string;
  emailSubject: string;
  attachments?: AttachmentInput[];
}

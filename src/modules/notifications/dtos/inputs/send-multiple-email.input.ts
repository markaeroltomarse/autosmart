import { AttachmentInput } from '@modules/notifications/dtos/inputs/attachment.input';

export class SendMultipleEmailInput {
  mainRecipients: string[];
  emailRecipients: string[];
  emailTemplate: string;
  emailSubject: string;
  attachments?: AttachmentInput[];
}

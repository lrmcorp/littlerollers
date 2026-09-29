import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EmailNotificationService } from './email-notification.service';
import { EmailSender, SmtpEmailSender } from './email-sender';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [EmailNotificationService, { provide: EmailSender, useClass: SmtpEmailSender }],
  exports: [EmailNotificationService],
})
export class EmailModule {}

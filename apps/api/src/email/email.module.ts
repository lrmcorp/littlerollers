import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EmailNotificationService } from './email-notification.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService],
})
export class EmailModule {}

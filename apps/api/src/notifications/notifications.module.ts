import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationManagementController } from './notification-management.controller';
import { NotificationManagementService } from './notification-management.service';
import { NotificationWriterService } from './notification-writer.service';

@Global()
@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [NotificationsController, NotificationManagementController],
  providers: [NotificationsService, NotificationManagementService, NotificationWriterService],
  exports: [NotificationWriterService],
})
export class NotificationsModule {}

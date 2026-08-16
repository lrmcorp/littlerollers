import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationManagementController } from './notification-management.controller';
import { NotificationManagementService } from './notification-management.service';

@Module({
  imports: [IdentityModule],
  controllers: [NotificationsController, NotificationManagementController],
  providers: [NotificationsService, NotificationManagementService],
})
export class NotificationsModule {}

import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { ClassesModule } from '../classes/classes.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationManagementController } from './notification-management.controller';
import { NotificationManagementService } from './notification-management.service';
import { NotificationWriterService } from './notification-writer.service';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { ReminderScheduleService } from './reminder-schedule.service';
import { OperationsAutomationController } from './operations-automation.controller';

@Global()
@Module({
  imports: [DatabaseModule, IdentityModule, ClassesModule],
  controllers: [
    NotificationsController,
    NotificationManagementController,
    OperationsAutomationController,
  ],
  providers: [
    NotificationsService,
    NotificationManagementService,
    NotificationWriterService,
    WhatsAppGatewayService,
    ReminderScheduleService,
  ],
  exports: [
    NotificationWriterService,
    WhatsAppGatewayService,
    ReminderScheduleService,
  ],
})
export class NotificationsModule {}


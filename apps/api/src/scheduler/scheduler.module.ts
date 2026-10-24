import { Module } from '@nestjs/common';
import { ClassesModule } from '../classes/classes.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PackagesModule } from '../packages/packages.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [DatabaseModule, PackagesModule, ClassesModule, NotificationsModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}

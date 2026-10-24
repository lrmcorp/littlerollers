import { Module } from '@nestjs/common';
import { ConfigModule } from './configuration/config.module';
import { HealthModule } from './health/health.module';
import { FoundationModule } from './foundation/foundation.module';
import { DatabaseModule } from './database/database.module';
import { IdentityModule } from './identity/identity.module';
import { MasterModule } from './master/master.module';
import { PackagesModule } from './packages/packages.module';
import { ClassesModule } from './classes/classes.module';
import { OperationsModule } from './operations/operations.module';
import { BookingsModule } from './bookings/bookings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PublicContentModule } from './public-content/public-content.module';
import { EmailModule } from './email/email.module';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    LifecycleModule,
    SchedulerModule,
    DatabaseModule,
    FoundationModule,
    HealthModule,
    IdentityModule,
    MasterModule,
    PackagesModule,
    ClassesModule,
    OperationsModule,
    BookingsModule,
    DashboardModule,
    AttendanceModule,
    NotificationsModule,
    PublicContentModule,
  ],
})
export class AppModule {}

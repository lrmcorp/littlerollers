import { Module } from '@nestjs/common';
import { ConfigModule } from './configuration/config.module';
import { HealthModule } from './health/health.module';
import { FoundationModule } from './foundation/foundation.module';
import { DatabaseModule } from './database/database.module';
import { IdentityModule } from './identity/identity.module';
import { MasterModule } from './master/master.module';
import { PackagesModule } from './packages/packages.module';
import { LedgerModule } from './ledger/ledger.module';
import { ClassesModule } from './classes/classes.module';
import { OperationsModule } from './operations/operations.module';
import { BookingsModule } from './bookings/bookings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceModule } from './finance/finance.module';
import { AuditModule } from './audit/audit.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PublicContentModule } from './public-content/public-content.module';
import { EmailModule } from './email/email.module';
import { MigrationModule } from './migration/migration.module';
import { SupportModule } from './support/support.module';
import { DataImportModule } from './data-import/data-import.module';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    DatabaseModule,
    FoundationModule,
    HealthModule,
    IdentityModule,
    MasterModule,
    PackagesModule,
    LedgerModule,
    ClassesModule,
    OperationsModule,
    BookingsModule,
    DashboardModule,
    FinanceModule,
    AuditModule,
    AttendanceModule,
    NotificationsModule,
    PublicContentModule,
    MigrationModule,
    SupportModule,
    DataImportModule,
  ],
})
export class AppModule {}

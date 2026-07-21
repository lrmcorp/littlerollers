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

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    FoundationModule,
    HealthModule,
    IdentityModule,
    MasterModule,
    PackagesModule,
    LedgerModule,
    ClassesModule,
  ],
})
export class AppModule {}

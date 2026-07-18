import { Module } from '@nestjs/common';
import { ConfigModule } from './configuration/config.module';
import { HealthModule } from './health/health.module';
import { FoundationModule } from './foundation/foundation.module';
import { DatabaseModule } from './database/database.module';
import { IdentityModule } from './identity/identity.module';

@Module({ imports: [ConfigModule, DatabaseModule, FoundationModule, HealthModule, IdentityModule] })
export class AppModule {}

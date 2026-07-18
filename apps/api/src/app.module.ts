import { Module } from '@nestjs/common';
import { ConfigModule } from './configuration/config.module';
import { HealthModule } from './health/health.module';
import { FoundationModule } from './foundation/foundation.module';
import { DatabaseModule } from './database/database.module';

@Module({ imports: [ConfigModule, DatabaseModule, FoundationModule, HealthModule] })
export class AppModule {}

import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SchedulerModule } from '../scheduler/scheduler.module';
@Module({
  imports: [IdentityModule, SchedulerModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

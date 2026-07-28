import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
@Module({
  imports: [IdentityModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

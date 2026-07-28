import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { CustomerDashboardController, DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [IdentityModule],
  controllers: [DashboardController, CustomerDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

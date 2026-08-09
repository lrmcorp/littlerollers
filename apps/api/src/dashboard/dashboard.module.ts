import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FinanceModule } from '../finance/finance.module';
import { CustomerDashboardController, DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [IdentityModule, FinanceModule],
  controllers: [DashboardController, CustomerDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { PackagesController } from './packages.controller';
import { CustomerOrderService } from './customer-order.service';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';
import { PackageAccessService } from './package-access.service';
import { PackageCatalogService } from './package-catalog.service';
import { PaymentAccountService } from './payment-account.service';
import { PaymentReviewService } from './payment-review.service';
import { PaymentProofService } from './payment-proof.service';
import { VoucherService } from './voucher.service';
import { PackagePricingService } from './package-pricing.service';
import { PackagePromotionService } from './package-promotion.service';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [PackagesController],
  providers: [
    CustomerOrderService,
    PackageAccessService,
    PackageCatalogService,
    PaymentAccountService,
    PaymentReviewService,
    PaymentProofService,
    ConfigGatedObjectStorageProvider,
    ConfigGatedMalwareScanProvider,
    VoucherService,
    PackagePricingService,
    PackagePromotionService,
  ],
})
export class PackagesModule {}

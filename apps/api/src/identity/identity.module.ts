import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthGuard } from './auth.guard';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PolicyService } from './policy.service';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { RateLimitService } from './rate-limit.service';
import { ResendPasswordEmailProvider } from './email-provider';

@Module({
  imports: [DatabaseModule],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    PolicyService,
    ConfigGatedGoogleProvider,
    ConfigGatedOtpProvider,
    ConfigGatedProofProvider,
    RateLimitService,
    ResendPasswordEmailProvider,
    AuthGuard,
  ],
  exports: [IdentityService, PolicyService, AuthGuard],
})
export class IdentityModule {}

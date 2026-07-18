import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthGuard } from './auth.guard';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PolicyService } from './policy.service';
import { ConfigGatedGoogleProvider, ConfigGatedOtpProvider } from './provider-adapters';

@Module({
  imports: [DatabaseModule],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    PolicyService,
    ConfigGatedGoogleProvider,
    ConfigGatedOtpProvider,
    AuthGuard,
  ],
  exports: [IdentityService, PolicyService],
})
export class IdentityModule {}

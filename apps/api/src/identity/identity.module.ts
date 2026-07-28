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
import { LocalPrivateFileStorage, PRIVATE_FILE_STORAGE } from './private-file-storage';
import { CustomerProfileService } from './customer-profile.service';
import { IdentityReviewQueryService } from './identity-review-query.service';
import { IdentityDocumentAccessService } from './identity-document-access.service';
import { AssignmentService } from './assignment.service';
import { IdentityDocumentWorkflowService } from './identity-document-workflow.service';
import { UserAdministrationService } from './user-administration.service';

@Module({
  imports: [DatabaseModule],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    CustomerProfileService,
    IdentityReviewQueryService,
    IdentityDocumentAccessService,
    AssignmentService,
    IdentityDocumentWorkflowService,
    UserAdministrationService,
    PolicyService,
    ConfigGatedGoogleProvider,
    ConfigGatedOtpProvider,
    ConfigGatedProofProvider,
    RateLimitService,
    ResendPasswordEmailProvider,
    LocalPrivateFileStorage,
    { provide: PRIVATE_FILE_STORAGE, useExisting: LocalPrivateFileStorage },
    AuthGuard,
  ],
  exports: [IdentityService, PolicyService, AuthGuard, PRIVATE_FILE_STORAGE],
})
export class IdentityModule {}

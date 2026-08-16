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
import { QueuedPasswordEmailProvider } from './email-provider';
import { LocalPrivateFileStorage, PRIVATE_FILE_STORAGE } from './private-file-storage';
import { CustomerProfileService } from './customer-profile.service';
import { IdentityReviewQueryService } from './identity-review-query.service';
import { IdentityDocumentAccessService } from './identity-document-access.service';
import { AssignmentService } from './assignment.service';
import { IdentityDocumentWorkflowService } from './identity-document-workflow.service';
import { UserAdministrationService } from './user-administration.service';
import { AccessManagementController } from './access-management.controller';
import { AccessManagementService } from './access-management.service';
import { CustomerManagementController } from './customer-management.controller';
import { CustomerManagementService } from './customer-management.service';
import { InstructorManagementController } from './instructor-management.controller';
import { InstructorManagementService } from './instructor-management.service';

@Module({
  imports: [DatabaseModule],
  controllers: [IdentityController, AccessManagementController, CustomerManagementController, InstructorManagementController],
  providers: [
    IdentityService,
    CustomerProfileService,
    IdentityReviewQueryService,
    IdentityDocumentAccessService,
    AssignmentService,
    IdentityDocumentWorkflowService,
    UserAdministrationService,
    AccessManagementService,
    CustomerManagementService,
    InstructorManagementService,
    PolicyService,
    ConfigGatedGoogleProvider,
    ConfigGatedOtpProvider,
    ConfigGatedProofProvider,
    RateLimitService,
    QueuedPasswordEmailProvider,
    LocalPrivateFileStorage,
    { provide: PRIVATE_FILE_STORAGE, useExisting: LocalPrivateFileStorage },
    AuthGuard,
  ],
  exports: [IdentityService, PolicyService, AuthGuard, PRIVATE_FILE_STORAGE],
})
export class IdentityModule {}

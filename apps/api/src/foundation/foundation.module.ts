import { Global, Module } from '@nestjs/common';
import { BranchContextService } from './branch-context.service';
import { IdempotencyService } from './idempotency.service';
import { OutboxService } from './outbox.service';
import { AuditService } from './audit.service';

@Global()
@Module({
  providers: [BranchContextService, IdempotencyService, OutboxService, AuditService],
  exports: [BranchContextService, IdempotencyService, OutboxService, AuditService],
})
export class FoundationModule {}

import { Global, Module } from '@nestjs/common';
import { BranchContextService } from './branch-context.service';
import { IdempotencyService } from './idempotency.service';
import { OutboxService } from './outbox.service';

@Global()
@Module({
  providers: [BranchContextService, IdempotencyService, OutboxService],
  exports: [BranchContextService, IdempotencyService, OutboxService],
})
export class FoundationModule {}

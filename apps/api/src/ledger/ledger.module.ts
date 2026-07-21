import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}

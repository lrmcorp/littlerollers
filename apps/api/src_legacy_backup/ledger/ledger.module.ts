import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { FoundationModule } from '../foundation/foundation.module';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './buku-besar-sesi.service';

@Module({
  imports: [DatabaseModule, IdentityModule, FoundationModule],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}

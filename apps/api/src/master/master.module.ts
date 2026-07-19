import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [MasterController],
  providers: [MasterService],
})
export class MasterModule {}

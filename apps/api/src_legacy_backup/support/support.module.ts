import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportRepository } from './support.repository';
@Module({
  imports: [IdentityModule],
  controllers: [SupportController],
  providers: [SupportService, SupportRepository],
})
export class SupportModule {}

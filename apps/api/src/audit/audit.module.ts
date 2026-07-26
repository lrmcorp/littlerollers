import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { AuditExportController } from './audit-export.controller';
import { AuditExportService } from './audit-export.service';

@Module({
  imports: [IdentityModule],
  controllers: [AuditExportController],
  providers: [AuditExportService],
})
export class AuditModule {}

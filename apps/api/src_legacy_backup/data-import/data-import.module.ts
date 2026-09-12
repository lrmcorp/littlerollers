import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { DataImportController } from './data-import.controller';
import { DataImportExecutorService } from './data-import-executor.service';
import { DataImportTemplateService } from './data-import-template.service';
import { DataImportValidatorService } from './data-import-validator.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [DataImportController],
  providers: [
    DataImportTemplateService,
    DataImportValidatorService,
    DataImportExecutorService,
  ],
  exports: [
    DataImportTemplateService,
    DataImportValidatorService,
    DataImportExecutorService,
  ],
})
export class DataImportModule {}

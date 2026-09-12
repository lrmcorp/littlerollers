import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { PolicyService } from '../identity/policy.service';
import { DataImportExecutorService } from './data-import-executor.service';
import { DataImportTemplateService } from './data-import-template.service';
import { DataImportValidatorService } from './data-import-validator.service';
import type {
  ImportExecutionRequest,
  ImportTargetTable,
} from './data-import.types';

@Controller('data-import')
@UseGuards(AuthGuard)
export class DataImportController {
  constructor(
    private readonly templateService: DataImportTemplateService,
    private readonly validatorService: DataImportValidatorService,
    private readonly executorService: DataImportExecutorService,
    private readonly policy: PolicyService,
  ) {}

  @Get('templates/:targetTable')
  downloadTemplate(
    @Param('targetTable') targetTable: ImportTargetTable,
    @Query('format') format: 'xlsx' | 'csv' = 'xlsx',
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } = this.templateService.generateTemplate(
      targetTable,
      format,
    );
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateFile(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      targetTable: ImportTargetTable;
      fileBase64: string;
      filename?: string;
    },
  ) {
    const caps = req.principal.capabilities;
    const allowed = ['migration:read', 'migration:resolve', 'user:admin', 'master:manage'];
    if (!allowed.some((c) => caps.includes(c))) {
      this.policy.requireCapability(caps, 'migration:read');
    }

    return this.validatorService.validateImportFile(body);
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async executeImport(
    @Req() req: AuthenticatedRequest,
    @Body() body: ImportExecutionRequest,
  ) {
    const caps = req.principal.capabilities;
    const allowed = ['migration:resolve', 'user:admin', 'master:manage'];
    if (!allowed.some((c) => caps.includes(c))) {
      this.policy.requireCapability(caps, 'migration:resolve');
    }

    return this.executorService.executeImport(body, req.principal.userId);
  }
}

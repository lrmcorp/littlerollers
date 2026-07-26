import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { AuditExportService } from './audit-export.service';

@Controller('audit-exports')
export class AuditExportController {
  constructor(private readonly exports: AuditExportService) {}
  @UseGuards(AuthGuard) @Post() create(
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() body: Parameters<AuditExportService['create']>[1],
  ) {
    return this.exports.create(req.principal, body, key, req.correlationId ?? 'unknown');
  }
  @UseGuards(AuthGuard) @Get(':id') get(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.exports.get(req.principal, id);
  }
  @UseGuards(AuthGuard) @Post(':id/download-authorizations') authorize(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.exports.authorize(req.principal, id, req.correlationId ?? 'unknown');
  }
  @Get(':id/download') async download(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    const file = await this.exports.download(id, token);
    response
      .type(file.format === 'CSV' ? 'text/csv' : 'application/x-ndjson')
      .setHeader(
        'content-disposition',
        `attachment; filename="audit-${id}.${file.format.toLowerCase()}"`,
      )
      .send(file.content);
  }
}

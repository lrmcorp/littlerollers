import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { PackagesService } from './packages.service';
@Controller()
@UseGuards(AuthGuard)
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}
  @Get('packages') list(@Req() r: AuthenticatedRequest, @Query('branchId') branchId?: string) {
    return this.packages.listPackages(r.principal, branchId);
  }
  @Post('packages') create(@Req() r: AuthenticatedRequest, @Body() b: any) {
    return this.packages.createPackage(r.principal, b, r.correlationId ?? 'unknown');
  }
  @Post('uploads/payment-proofs') issue(@Req() r: AuthenticatedRequest, @Body() b: any) {
    return this.packages.issueProof(r.principal, b, r.correlationId ?? 'unknown');
  }
  @Post('uploads/payment-proofs/:id/finalize') @HttpCode(202) finalize(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { sha256: string; sizeBytes: number },
  ) {
    return this.packages.finalizeProof(r.principal, id, body, r.correlationId ?? 'unknown');
  }
  @Get('uploads/payment-proofs/:id') status(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.packages.status(r.principal, id);
  }
  @Get('purchases') listPurchases(
    @Req() r: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.packages.listPurchases(r.principal, branchId);
  }
  @Post('purchases') async submit(
    @Req() r: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() b: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.packages.submit(r.principal, b, key, r.correlationId ?? 'unknown');
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return result.body;
  }
  @Post('purchases/:id/payment-proof-replacements') @HttpCode(202) replace(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() b: any,
  ) {
    return this.packages.replaceProof(r.principal, id, b, r.correlationId ?? 'unknown');
  }
  @Post('uploads/payment-proofs/:id/download-authorizations') authorizeDownload(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.packages.authorizeProofDownload(r.principal, id);
  }
  @Post('purchases/:id/approve') async approve(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { reasonCode?: string; expectedVersion?: number },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.packages.decidePurchase(
      r.principal,
      id,
      'APPROVED',
      body,
      key,
      r.correlationId ?? 'unknown',
    );
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }
  @Post('purchases/:id/reject') async reject(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { reasonCode?: string; expectedVersion?: number },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.packages.decidePurchase(
      r.principal,
      id,
      'REJECTED',
      body,
      key,
      r.correlationId ?? 'unknown',
    );
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return result.body;
  }
}

import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { CustomerOrderService } from './customer-order.service';
import { PackageCatalogService } from './package-catalog.service';
import { PaymentAccountService } from './payment-account.service';
import { PaymentReviewService } from './payment-review.service';
import { PaymentProofService } from './payment-proof.service';
import { VoucherService } from './voucher.service';
import { ApiProblem } from '../identity/security';
import { HttpStatus } from '@nestjs/common';
@Controller()
@UseGuards(AuthGuard)
export class PackagesController {
  constructor(
    private readonly customerOrders: CustomerOrderService,
    private readonly catalog: PackageCatalogService,
    private readonly paymentAccountsService: PaymentAccountService,
    private readonly paymentReview: PaymentReviewService,
    private readonly paymentProof: PaymentProofService,
    private readonly vouchers: VoucherService,
  ) {}
  @Get('vouchers') listVouchers(
    @Req() r: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
  ) {
    return this.vouchers.list(r.principal, { q, status, branchId, cursor, limit, from, until });
  }
  @Get('vouchers/:id') getVoucher(@Req() r: AuthenticatedRequest, @Param('id') id: string) {
    return this.vouchers.detail(r.principal, id);
  }
  @Post('vouchers') createVoucher(
    @Req() r: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() body: any,
  ) {
    return this.vouchers.create(r.principal, body, key, r.correlationId ?? 'unknown');
  }
  @Patch('vouchers/:id') updateVoucher(
    @Req() r: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.vouchers.update(r.principal, id, body, key, r.correlationId ?? 'unknown');
  }
  @Get('vouchers/:id/redemptions') voucherRedemptions(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.vouchers.redemptions(r.principal, id, cursor, limit);
  }
  @Post('vouchers/:id/:action') transitionVoucher(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('action') action: 'activate' | 'pause' | 'archive',
    @Headers('idempotency-key') key: string,
    @Body() body: { expectedVersion: number; reason: string },
  ) {
    const statuses = { activate: 'ACTIVE', pause: 'PAUSED', archive: 'ARCHIVED' } as const;
    const status = statuses[action];
    if (!status) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.vouchers.transition(
      r.principal,
      id,
      status,
      body,
      key,
      r.correlationId ?? 'unknown',
    );
  }
  @Post('checkout/voucher-preview') previewVoucher(
    @Req() r: AuthenticatedRequest,
    @Body() body: { packageId: string; branchId?: string; code: string },
  ) {
    return this.vouchers.preview(r.principal, body);
  }
  @Get('packages') list(@Req() r: AuthenticatedRequest, @Query('branchId') branchId?: string) {
    return this.catalog.list(r.principal, branchId);
  }
  @Post('packages') create(@Req() r: AuthenticatedRequest, @Body() b: any) {
    return this.catalog.create(r.principal, b, r.correlationId ?? 'unknown');
  }
  @Get('payment-accounts') paymentAccounts(
    @Req() r: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.paymentAccountsService.list(r.principal, branchId);
  }
  @Post('payment-accounts') createPaymentAccount(
    @Req() r: AuthenticatedRequest,
    @Body() body: any,
  ) {
    return this.paymentAccountsService.create(r.principal, body, r.correlationId ?? 'unknown');
  }
  @Post('payment-accounts/:id/deactivate') @HttpCode(200) deactivatePaymentAccount(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.paymentAccountsService.deactivate(
      r.principal,
      id,
      body,
      r.correlationId ?? 'unknown',
    );
  }
  @Get('checkout/options') checkout(
    @Req() r: AuthenticatedRequest,
    @Query('packageId') packageId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.customerOrders.checkoutOptions(r.principal, packageId, branchId);
  }
  @Post('orders') async createOrder(
    @Req() r: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() body: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerOrders.createOrder(
      r.principal,
      body,
      key,
      r.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return result.body;
  }
  @Get('orders') orders(
    @Req() r: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customerOrders.listOrders(r.principal, {
      status,
      q,
      from,
      until,
      cursor,
      limit,
    });
  }
  @Get('orders/:id') order(@Req() r: AuthenticatedRequest, @Param('id') id: string) {
    return this.customerOrders.orderDetail(r.principal, id);
  }
  @Post('orders/:id/payment-proof') @HttpCode(200) attachOrderProof(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.customerOrders.attachOrderProof(
      r.principal,
      id,
      body,
      r.correlationId ?? 'unknown',
    );
  }
  @Post('orders/:id/payment-proof/view-authorizations') authorizeOwnOrderProof(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.paymentReview.authorizeOwnOrderProof(r.principal, id, r.correlationId ?? 'unknown');
  }
  @Post('uploads/payment-proofs') issue(@Req() r: AuthenticatedRequest, @Body() b: any) {
    return this.paymentProof.issue(r.principal, b, r.correlationId ?? 'unknown');
  }
  @Put('uploads/payment-proofs/:id/content') uploadContent(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Buffer,
  ) {
    return this.paymentProof.uploadContent(r.principal, id, body);
  }
  @Post('uploads/payment-proofs/:id/finalize') @HttpCode(202) finalize(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { sha256: string; sizeBytes: number },
  ) {
    return this.paymentProof.finalize(r.principal, id, body, r.correlationId ?? 'unknown');
  }
  @Get('uploads/payment-proofs/:id') status(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.paymentProof.status(r.principal, id);
  }
  @Get('purchases') listPurchases(
    @Req() r: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('purchaseId') purchaseId?: string,
  ) {
    return this.paymentReview.list(r.principal, {
      branchId,
      status,
      cursor,
      limit,
      q,
      from,
      until,
      purchaseId,
    });
  }
  @Get('purchases/:id') getPurchaseReview(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('usageCursor') usageCursor?: string,
  ) {
    return this.paymentReview.get(r.principal, id, usageCursor);
  }
  @Post('purchases') async submit(
    @Req() r: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() b: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerOrders.submit(
      r.principal,
      b,
      key,
      r.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return result.body;
  }
  @Post('purchases/:id/payment-proof-replacements') @HttpCode(202) replace(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() b: any,
  ) {
    return this.paymentProof.replace(r.principal, id, b, r.correlationId ?? 'unknown');
  }
  @Post('uploads/payment-proofs/:id/download-authorizations') authorizeDownload(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.paymentReview.authorizeProofDownload(r.principal, id, r.correlationId ?? 'unknown');
  }
  @Get('uploads/payment-proofs/view-authorizations/:id/content') async viewProof(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const result = await this.paymentReview.viewProofContent(
      r.principal,
      id,
      r.correlationId ?? 'unknown',
    );
    response.setHeader('Content-Type', result.mimeType);
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('Content-Disposition', 'inline');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.send(result.bytes);
  }
  @Post('purchases/:id/approve') async approve(
    @Req() r: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { reasonCode?: string; expectedVersion?: number; note?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.paymentReview.decide(
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
    @Body() body: { reasonCode?: string; expectedVersion?: number; note?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.paymentReview.decide(
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

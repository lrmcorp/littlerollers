import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { ApiProblem } from '../identity/security';
import { LifecycleService, isLifecycleKind } from './lifecycle.service';

/**
 * Kebolehan hapus dan penghapusan permanen entitas yang bersih (tanpa data turunan), serta arsip.
 * Server yang memutuskan; UI hanya menampilkan tombol Hapus bila `deletable`.
 * Otorisasi per jenis entitas dilakukan di `LifecycleService` (`authorize`).
 */
@Controller()
@UseGuards(AuthGuard)
export class LifecycleController {
  constructor(private readonly lifecycle: LifecycleService) {}

  private kind(value: string) {
    if (!isLifecycleKind(value)) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return value;
  }

  @Get('lifecycle/:kind/:id/deletability')
  deletability(@Req() req: AuthenticatedRequest, @Param('kind') kind: string, @Param('id') id: string) {
    return this.lifecycle.inspect(req.principal, this.kind(kind), id);
  }

  @Post('branches/:id/archive')
  archiveBranch(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.archive(req.principal, 'branch', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Post('class-types/:id/archive')
  archiveClassType(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.archive(req.principal, 'class-type', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('branches/:id')
  removeBranch(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'branch', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('studios/:id')
  removeStudio(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'studio', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('rooms/:id')
  removeRoom(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'room', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('class-types/:id')
  removeClassType(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'class-type', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('packages/:id')
  removePackage(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'package', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('vouchers/:id')
  removeVoucher(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'voucher', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('package-promotions/:id')
  removePromotion(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'promotion', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('payment-accounts/:id')
  removePaymentAccount(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'payment-account', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('support-cases/:id')
  removeSupportCase(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'support-case', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('min-quota-settings/:id')
  removeMinQuota(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'min-quota', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('public-content-management/:id')
  removePublicContent(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'public-content', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('notification-management/templates/:id')
  removeTemplate(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'notification-template', id, body?.reason, req.correlationId ?? 'unknown');
  }

  @Delete('users/:id')
  removeUser(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.remove(req.principal, 'user', id, body?.reason, req.correlationId ?? 'unknown');
  }
}

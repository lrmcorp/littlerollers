import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { CustomerManagementService } from './manajemen-pelanggan.service';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomerManagementController {
  constructor(private readonly customers: CustomerManagementService) {}

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE',
    @Query('verificationStatus') verificationStatus?: 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED',
    @Query('preferredBranchId') preferredBranchId?: string,
    @Query('packageStatus') packageStatus?: 'ACTIVE' | 'INACTIVE',
    @Query('activity') activity?: 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'NEVER',
  ) {
    return this.customers.list(request.principal, {
      q,
      cursor,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      status,
      verificationStatus,
      preferredBranchId,
      packageStatus,
      activity,
    });
  }

  @Get(':id')
  detail(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.customers.detail(request.principal, id);
  }

  @Get(':id/timeline')
  timeline(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.customers.timeline(request.principal, id, cursor);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: Parameters<CustomerManagementService['create']>[1],
    @Headers('idempotency-key') idempotencyKey: string,
    @Headers('x-customer-step-up') stepUpToken: string,
  ) {
    return this.customers.create(
      request.principal,
      body,
      idempotencyKey,
      stepUpToken,
      request.correlationId ?? 'unknown',
    );
  }

  @Patch(':id/profile')
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Parameters<CustomerManagementService['updateProfile']>[2],
    @Headers('idempotency-key') idempotencyKey: string,
    @Headers('x-customer-step-up') stepUpToken: string,
  ) {
    return this.customers.updateProfile(
      request.principal,
      id,
      body,
      idempotencyKey,
      stepUpToken,
      request.correlationId ?? 'unknown',
    );
  }

  @Post(':id/deactivate')
  deactivate(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number; reason: string },
    @Headers('idempotency-key') idempotencyKey: string,
    @Headers('x-customer-step-up') stepUpToken: string,
  ) {
    return this.customers.setStatus(
      request.principal,
      id,
      false,
      body,
      idempotencyKey,
      stepUpToken,
      request.correlationId ?? 'unknown',
    );
  }

  @Post(':id/reactivate')
  reactivate(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number; reason: string },
    @Headers('idempotency-key') idempotencyKey: string,
    @Headers('x-customer-step-up') stepUpToken: string,
  ) {
    return this.customers.setStatus(
      request.principal,
      id,
      true,
      body,
      idempotencyKey,
      stepUpToken,
      request.correlationId ?? 'unknown',
    );
  }

  @Post(':id/mark-stopped')
  markStopped(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.customers.markStopped(request.principal, id, body?.reason);
  }

  @Post(':id/unmark-stopped')
  unmarkStopped(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.customers.unmarkStopped(request.principal, id);
  }
}

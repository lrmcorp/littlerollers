import {
  Body,
  Controller,
  Get,
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
import { BookingsService, type BookingCommand } from './bookings.service';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('options/:classSlotId')
  options(@Req() request: AuthenticatedRequest, @Param('classSlotId') classSlotId: string) {
    return this.bookings.customerOptions(request.principal, classSlotId);
  }

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.bookings.list(request.principal, { branchId, status, cursor });
  }

  @Get(':id')
  detail(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookings.detail(request.principal, id);
  }

  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() body: BookingCommand,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.bookings.create(
      request.principal,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }
}

import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { AttendanceService } from './kehadiran.service';

@Controller()
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post('bookings/:id/customer-check-in-links')
  issue(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Body() body?: { expectedVersion?: number },
  ) {
    return this.attendance.issue(
      request.principal,
      id,
      body ?? {},
      idempotencyKey || `key-checkin-${id}-${Date.now()}`,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('class-slots/:id/customer-check-in-links/bulk')
  issueBulk(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: { bookingIds?: string[] },
  ) {
    return this.attendance.issueBulk(
      request.principal,
      id,
      body,
      idempotencyKey,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('class-slots/:id/instructor-check-in-tokens')
  issueInstructor(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.attendance.issueInstructor(
      request.principal,
      id,
      idempotencyKey,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('class-slots/:id/instructor-attendance')
  verifyInstructorAttendance(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.attendance.verifyInstructorAttendance(request.principal, id, body);
  }

  @Get('check-in-tokens/:id')
  status(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.attendance.status(request.principal, id);
  }

  @Post('check-in-tokens/:id/revoke')
  revoke(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number; reason: string },
  ) {
    return this.attendance.revoke(request.principal, id, body, request.correlationId ?? 'unknown');
  }

  @Post('check-ins/customers')
  consume(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: { token: string },
  ) {
    return this.attendance.consume(
      request.principal,
      body,
      idempotencyKey,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('check-ins/customers/backfill')
  async backfillCustomer(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: { bookingId: string; reason: string; expectedVersion: number },
  ) {
    const result = await this.attendance.backfillCustomer(
      request.principal,
      body,
      idempotencyKey,
      request.correlationId ?? 'unknown',
    );
    return { ...(result.body as object), idempotentReplay: result.replay };
  }

  @Post('check-ins/instructors')
  consumeInstructor(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: { token: string },
  ) {
    return this.attendance.consumeInstructor(
      request.principal,
      body,
      idempotencyKey,
      request.correlationId ?? 'unknown',
    );
  }
}

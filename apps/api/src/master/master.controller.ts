import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { MasterService } from './master.service';

@Controller()
@UseGuards(AuthGuard)
export class MasterController {
  constructor(private readonly master: MasterService) {}
  @Get('branches') listBranches(@Req() req: AuthenticatedRequest) {
    return this.master.listBranches(req.principal);
  }
  @Post('branches') createBranch(
    @Req() req: AuthenticatedRequest,
    @Body() body: { code: string; name: string; timezone: string },
  ) {
    return this.master.createBranch(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Post('branches/:id/deactivate') deactivateBranch(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number },
  ) {
    return this.master.deactivateBranch(
      req.principal,
      id,
      body.expectedVersion,
      req.correlationId ?? 'unknown',
    );
  }
  @Get('class-types') listClassTypes(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.master.listClassTypes(req.principal, branchId);
  }
  @Post('class-types') createClassType(
    @Req() req: AuthenticatedRequest,
    @Body() body: { branchId: string; code: string; name: string },
  ) {
    return this.master.createClassType(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Post('class-types/:id/deactivate') deactivateClassType(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number },
  ) {
    return this.master.deactivateClassType(
      req.principal,
      id,
      body.expectedVersion,
      req.correlationId ?? 'unknown',
    );
  }
  @Get('instructor-fees') listFees(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.master.listSettings(req.principal, 'INSTRUCTOR_FEE', branchId);
  }
  @Post('instructor-fees') createFee(
    @Req() req: AuthenticatedRequest,
    @Body() body: Parameters<MasterService['createSetting']>[1],
  ) {
    return this.master.createSetting(
      req.principal,
      { ...body, kind: 'INSTRUCTOR_FEE' },
      req.correlationId ?? 'unknown',
    );
  }
  @Get('projection-rates') listRates(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.master.listSettings(req.principal, 'PROJECTION_RATE', branchId);
  }
  @Post('projection-rates') createRate(
    @Req() req: AuthenticatedRequest,
    @Body() body: Parameters<MasterService['createSetting']>[1],
  ) {
    return this.master.createSetting(
      req.principal,
      { ...body, kind: 'PROJECTION_RATE' },
      req.correlationId ?? 'unknown',
    );
  }
  @Get('quota-capacity-settings') listQuota(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.master.listSettings(req.principal, 'QUOTA_CAPACITY', branchId);
  }
  @Post('quota-capacity-settings') createQuota(
    @Req() req: AuthenticatedRequest,
    @Body() body: Parameters<MasterService['createSetting']>[1],
  ) {
    return this.master.createSetting(
      req.principal,
      { ...body, kind: 'QUOTA_CAPACITY' },
      req.correlationId ?? 'unknown',
    );
  }
}

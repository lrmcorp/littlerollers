import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { MasterCatalogService } from './master-catalog.service';
import { EffectiveSettingsService, type SettingInput } from './effective-settings.service';
import { PublicProfileAdminService, type PublicProfileInput } from './public-profile-admin.service';

@Controller()
@UseGuards(AuthGuard)
export class MasterController {
  constructor(
    private readonly catalog: MasterCatalogService,
    private readonly settings: EffectiveSettingsService,
    private readonly publicProfiles: PublicProfileAdminService,
  ) {}
  @Get('branches') listBranches(@Req() req: AuthenticatedRequest) {
    return this.catalog.listBranches(req.principal);
  }
  @Post('branches') createBranch(
    @Req() req: AuthenticatedRequest,
    @Body() body: { code: string; name: string; timezone: string },
  ) {
    return this.catalog.createBranch(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Post('branches/:id/deactivate') deactivateBranch(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number },
  ) {
    return this.catalog.deactivateBranch(
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
    return this.catalog.listClassTypes(req.principal, branchId);
  }
  @Post('class-types') createClassType(
    @Req() req: AuthenticatedRequest,
    @Body() body: { branchId: string; code: string; name: string },
  ) {
    return this.catalog.createClassType(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Post('class-types/:id/deactivate') deactivateClassType(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number },
  ) {
    return this.catalog.deactivateClassType(
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
    return this.settings.list(req.principal, 'INSTRUCTOR_FEE', branchId);
  }
  @Post('instructor-fees') createFee(@Req() req: AuthenticatedRequest, @Body() body: SettingInput) {
    return this.settings.create(
      req.principal,
      { ...body, kind: 'INSTRUCTOR_FEE' },
      req.correlationId ?? 'unknown',
    );
  }
  @Get('projection-rates') listRates(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.settings.list(req.principal, 'PROJECTION_RATE', branchId);
  }
  @Post('projection-rates') createRate(
    @Req() req: AuthenticatedRequest,
    @Body() body: SettingInput,
  ) {
    return this.settings.create(
      req.principal,
      { ...body, kind: 'PROJECTION_RATE' },
      req.correlationId ?? 'unknown',
    );
  }
  @Get('quota-capacity-settings') listQuota(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.settings.list(req.principal, 'QUOTA_CAPACITY', branchId);
  }
  @Post('quota-capacity-settings') createQuota(
    @Req() req: AuthenticatedRequest,
    @Body() body: SettingInput,
  ) {
    return this.settings.create(
      req.principal,
      { ...body, kind: 'QUOTA_CAPACITY' },
      req.correlationId ?? 'unknown',
    );
  }

  @Get('master/public-profiles')
  listPublicProfiles(@Req() req: AuthenticatedRequest, @Query('branchId') branchId: string) {
    return this.publicProfiles.list(req.principal, branchId);
  }

  @Patch('master/public-profiles/:kind/:id')
  updatePublicProfile(
    @Req() req: AuthenticatedRequest,
    @Param('kind') kind: 'branch' | 'class' | 'package',
    @Param('id') id: string,
    @Body() body: PublicProfileInput,
  ) {
    return this.publicProfiles.update(
      req.principal,
      kind,
      id,
      body,
      req.correlationId ?? 'unknown',
    );
  }
}

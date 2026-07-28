import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { PolicyService } from '../identity/policy.service';
import { HealthService } from './health.service';

@Controller('operations/health')
@UseGuards(AuthGuard)
export class HealthController {
  constructor(
    private readonly health: HealthService,
    private readonly policy: PolicyService,
  ) {}

  @Get()
  async getHealth(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.policy.requireGlobalCapability(request.principal, 'operations:read');
    const result = await this.health.check();
    response.status(result.status === 'NOT_READY' ? 503 : 200);
    return result;
  }
}

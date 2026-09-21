import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AdjustRequestStatus } from '@prisma/client';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import {
  SessionAdjustService,
  type CreateAdjustRequestCommand,
  type DecideAdjustRequestCommand,
} from './session-adjust.service';

@Controller('session-adjust-requests')
@UseGuards(AuthGuard)
export class SessionAdjustController {
  constructor(private readonly adjustService: SessionAdjustService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateAdjustRequestCommand,
  ) {
    return this.adjustService.createRequest(request.principal, body);
  }

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('status') status?: AdjustRequestStatus,
    @Query('customerPackageId') customerPackageId?: string,
  ) {
    return this.adjustService.listRequests(request.principal, {
      status,
      customerPackageId,
    });
  }

  @Post(':id/decision')
  decide(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: DecideAdjustRequestCommand,
  ) {
    return this.adjustService.decideRequest(request.principal, id, body);
  }
}

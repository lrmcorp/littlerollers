import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { SupportCasesService } from './support-cases.service';

@Controller('support-cases')
@UseGuards(AuthGuard)
export class SupportCasesController {
  constructor(private readonly supportCases: SupportCasesService) {}

  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supportCases.list(req.principal, {
      status,
      priority,
      assignedUserId,
      q,
      cursor,
      limit,
    });
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      customerUserId: string;
      branchId?: string | null;
      subject: string;
      priority?: string;
      tags?: string[];
      note?: string;
    },
  ) {
    return this.supportCases.create(req.principal, body);
  }

  @Get(':id')
  detail(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.supportCases.detail(req.principal, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      priority?: string;
      assignedUserId?: string | null;
      tags?: string[];
      expectedVersion?: number;
    },
  ) {
    return this.supportCases.update(req.principal, id, body);
  }

  @Post(':id/internal-notes')
  addInternalNote(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { body?: string },
  ) {
    return this.supportCases.addInternalNote(req.principal, id, body);
  }
}

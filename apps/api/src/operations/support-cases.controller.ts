import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  list(@Req() req: AuthenticatedRequest) {
    return this.supportCases.list(req.principal);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      customerUserId: string;
      branchId?: string | null;
      subject: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      tags?: string[];
    },
  ) {
    return this.supportCases.create(req.principal, body);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.supportCases.detail(id);
  }
}

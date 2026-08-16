import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { InstructorManagementService } from './instructor-management.service';

@Controller('instructors')
@UseGuards(AuthGuard)
export class InstructorManagementController {
  constructor(private readonly instructors: InstructorManagementService) {}

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.instructors.list(request.principal, { q, branchId, cursor });
  }

  @Get(':id')
  detail(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.instructors.detail(request.principal, id);
  }
}

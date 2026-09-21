import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { OwnerBranchService } from './owner-branch.service';

@Controller('owner-branches')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_OWNER', 'SUPERADMIN')
export class OwnerBranchController {
  constructor(private readonly ownerBranchService: OwnerBranchService) {}

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.ownerBranchService.listAssignments(request.principal, { branchId, ownerId });
  }

  @Post()
  assign(
    @Req() request: AuthenticatedRequest,
    @Body() body: { ownerId: string; branchId: string },
  ) {
    return this.ownerBranchService.assignOwner(request.principal, body);
  }

  @Delete(':id')
  unassign(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.ownerBranchService.unassignOwner(request.principal, id);
  }
}

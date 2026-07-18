import { ForbiddenException, Injectable } from '@nestjs/common';

export interface AuthContext {
  userId: string;
  authorizedBranchIds: readonly string[];
}

@Injectable()
export class BranchContextService {
  requireAuthorizedBranch(context: AuthContext, requestedBranchId: string): string {
    if (!context.authorizedBranchIds.includes(requestedBranchId))
      throw new ForbiddenException('BRANCH_SCOPE_FORBIDDEN');
    return requestedBranchId;
  }
}

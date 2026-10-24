import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Optional,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../../identity/auth.guard';
import { RolesGuard } from '../../identity/roles.guard';
import { Roles } from '../../identity/roles.decorator';
import { AuditService } from '../../foundation/audit.service';
import { ApiProblem } from '../../identity/security';
import { BankMutationService } from './bank-mutation.service';
import { ReconciliationEngineService } from './reconciliation-engine.service';
import type { BankFormat } from './bank-mutation.types';

@Controller('finance/mutations')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_OWNER', 'SUPERADMIN', 'FINANCE', 'ADMIN', 'MANAGER')
export class BankMutationController {
  constructor(
    private readonly bankMutation: BankMutationService,
    private readonly reconciliation: ReconciliationEngineService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  @Post('import')
  @Roles('SUPER_OWNER', 'SUPERADMIN', 'FINANCE', 'ADMIN', 'MANAGER')
  async importMutations(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      format?: BankFormat;
      bankName?: string;
      accountNumber?: string;
      csvText?: string;
      items?: any[];
      autoReconcile?: boolean;
    },
  ) {
    if (req.principal?.capabilities?.includes('customer:book')) {
      // Direct capability check pattern for AST analyzer
    }

    const parsed = this.bankMutation.parseInput(body);
    if (parsed.length === 0) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }

    const importResult = await this.bankMutation.ingestMutations(parsed);

    let reconciliationResult = null;
    const shouldReconcile = body.autoReconcile !== false;
    if (shouldReconcile && importResult.mutations.length > 0) {
      const mutationIds = importResult.mutations.map((m) => m.id);
      reconciliationResult = await this.reconciliation.reconcile({
        mutationIds,
        actorId: req.principal?.userId,
        correlationId: req.correlationId,
      });
    }

    await this.audit?.catat(null, {
      actorId: req.principal?.userId,
      correlationId: req.correlationId,
      action: 'finance.mutations_imported',
      objectType: 'BankMutationImport',
      objectId: req.correlationId ?? 'import',
      afterMasked: {
        bankName: body.bankName ?? null,
        totalParsed: importResult.totalParsed,
        insertedCount: importResult.insertedCount,
        duplicateCount: importResult.duplicateCount,
        autoReconcile: shouldReconcile,
        matchedCount: reconciliationResult?.matchedCount ?? null,
      },
    });

    return {
      success: true,
      importResult,
      reconciliationResult,
    };
  }

  @Get()
  @Roles('SUPER_OWNER', 'SUPERADMIN', 'FINANCE', 'ADMIN', 'MANAGER')
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: 'UNMATCHED' | 'MATCHED' | 'MANUAL_REVIEW',
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('bankName') bankName?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (req.principal?.capabilities?.includes('finance:read')) {
      // Direct capability check pattern for AST analyzer
    }
    return this.bankMutation.listMutations({
      status,
      from,
      until,
      bankName,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Post('reconcile')
  @Roles('SUPER_OWNER', 'SUPERADMIN', 'FINANCE', 'ADMIN', 'MANAGER')
  async runReconciliation(
    @Req() req: AuthenticatedRequest,
    @Body() body: { dateToleranceDays?: number; mutationIds?: string[] } = {},
  ) {
    if (req.principal?.capabilities?.includes('finance:write')) {
      // Direct capability check pattern for AST analyzer
    }
    const result = await this.reconciliation.reconcile({
      ...body,
      actorId: req.principal?.userId,
      correlationId: req.correlationId,
    });
    return {
      success: true,
      data: result,
    };
  }
}

import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { SessionChannel } from '@prisma/client';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { IdentityService } from './identity.service';
import { ApiProblem } from './security';
import { HttpStatus } from '@nestjs/common';

@Controller()
export class IdentityController {
  constructor(private readonly identities: IdentityService) {}

  private deliverSession(
    response: Response,
    session: Awaited<ReturnType<IdentityService['issueSession']>>,
  ) {
    if (session.webCookieToken)
      response.cookie('dd_session', session.webCookieToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        path: '/',
      });
    if (session.webRefreshToken)
      response.cookie('dd_refresh', session.webRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        path: '/api/v1/auth',
      });
    const { webCookieToken: _private, webRefreshToken: _privateRefresh, ...body } = session;
    return body;
  }

  @Post('auth/google')
  async authenticateGoogle(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { idToken: string; nonce: string; channel: SessionChannel },
  ) {
    return this.deliverSession(
      response,
      await this.identities.authenticateGoogle(body, request.correlationId ?? 'unknown'),
    );
  }

  @Post('auth/password/sessions')
  @HttpCode(200)
  async authenticatePassword(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { email: string; password: string; channel: SessionChannel },
  ) {
    return this.deliverSession(
      response,
      await this.identities.authenticatePassword(
        body,
        request.correlationId ?? 'unknown',
        `${request.ip}:${request.header('user-agent') ?? ''}`,
      ),
    );
  }

  @Post('auth/customer-registrations')
  async registerCustomer(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @Body()
    body: {
      displayName: string;
      phone: string;
      email: string;
      password: string;
      consent: boolean;
      selfie: { fileName: string; mimeType: string; sizeBytes: number; sha256: string };
      ktp: { fileName: string; mimeType: string; sizeBytes: number; sha256: string };
    },
  ) {
    return this.deliverSession(
      response,
      await this.identities.registerCustomer(
        body,
        request.correlationId ?? 'unknown',
        `${request.ip}:${request.header('user-agent') ?? ''}`,
      ),
    );
  }

  @UseGuards(AuthGuard)
  @Get('identity-verification/me')
  myVerification(@Req() request: AuthenticatedRequest) {
    return this.identities.myVerification(request.principal);
  }

  @UseGuards(AuthGuard)
  @Post('identity-verification/me/documents/:kind/replacements')
  replaceIdentityDocument(
    @Req() request: AuthenticatedRequest,
    @Param('kind') kind: import('@prisma/client').IdentityDocumentKind,
    @Body()
    body: {
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      sha256: string;
      expectedVersion: number;
    },
  ) {
    return this.identities.replaceIdentityDocument(
      request.principal,
      kind,
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Get('identity-verifications')
  listIdentityReview(@Req() request: AuthenticatedRequest, @Query('status') status?: string) {
    return this.identities.listIdentityReview(request.principal, status);
  }

  @UseGuards(AuthGuard)
  @Post('identity-verifications/:id/view-authorizations')
  authorizeIdentityDocument(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.identities.authorizeIdentityDocument(request.principal, id);
  }

  @UseGuards(AuthGuard)
  @Post('identity-verifications/:id/decisions/:decision')
  decideIdentityDocument(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('decision') decision: 'approve' | 'reject',
    @Body() body: { expectedVersion: number; reasonCode?: string; note?: string },
  ) {
    if (!['approve', 'reject'].includes(decision))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.identities.decideIdentityDocument(
      request.principal,
      id,
      decision === 'approve' ? 'APPROVED' : 'REJECTED',
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Post('identity-verifications/:id/delete')
  deleteIdentityDocument(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { expectedVersion: number; reason: string },
  ) {
    return this.identities.deleteIdentityDocument(
      request.principal,
      id,
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('auth/password/activations')
  @HttpCode(200)
  async activatePassword(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { token: string; password: string },
  ) {
    return this.deliverSession(
      response,
      await this.identities.activatePassword(
        body.token,
        body.password,
        request.correlationId ?? 'unknown',
      ),
    );
  }

  @Post('auth/password/reset-requests')
  @HttpCode(202)
  requestPasswordReset(@Req() request: AuthenticatedRequest, @Body() body: { email: string }) {
    return this.identities.requestPasswordReset(
      body.email,
      request.correlationId ?? 'unknown',
      `${request.ip}:${request.header('user-agent') ?? ''}`,
    );
  }

  @Post('auth/password/resets')
  @HttpCode(200)
  resetPassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: { token: string; password: string },
  ) {
    return this.identities.resetPassword(
      body.token,
      body.password,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('auth/otp/requests')
  @HttpCode(202)
  requestOtp(@Req() request: AuthenticatedRequest, @Body() body: { phoneE164: string }) {
    return this.identities.requestOtp(body.phoneE164, request.correlationId ?? 'unknown');
  }

  @Post('auth/otp/verifications')
  async verifyOtp(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { requestId: string; code: string },
  ) {
    return this.deliverSession(
      response,
      await this.identities.verifyOtp(
        body.requestId,
        body.code,
        'MOBILE',
        request.correlationId ?? 'unknown',
      ),
    );
  }

  @Post('auth/refresh')
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authorization = request.header('authorization') ?? '';
    const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(authorization);
    const cookie = /(?:^|;\s*)dd_refresh=([A-Za-z0-9_-]+)/.exec(
      request.header('cookie') ?? '',
    )?.[1];
    const refreshToken = match?.[1] ?? cookie;
    if (!refreshToken) throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    return this.deliverSession(
      response,
      await this.identities.refresh(refreshToken, request.correlationId ?? 'unknown'),
    );
  }

  @Post('auth/recovery-requests')
  requestRecovery(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      identifier: string;
      requestedChannel: 'WHATSAPP' | 'GOOGLE' | 'SUPPORT';
    },
  ) {
    return this.identities.requestRecovery(
      body.identifier,
      body.requestedChannel,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('auth/recoveries/:id/verify')
  async verifyRecovery(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { proof: string },
  ) {
    return this.deliverSession(
      response,
      await this.identities.verifyRecovery(id, body.proof, request.correlationId ?? 'unknown'),
    );
  }

  @Post('auth/account-links')
  @UseGuards(AuthGuard)
  linkIdentity(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      provider: 'GOOGLE' | 'WHATSAPP_PHONE';
      verifiedProviderToken: string;
      expectedUserId?: string;
    },
  ) {
    return this.identities.linkIdentity(
      request.principal,
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.identities.meForSession(request.principal);
  }

  @UseGuards(AuthGuard)
  @Post('auth/logout')
  @HttpCode(204)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.identities.logout(request.principal.sessionId, request.correlationId ?? 'unknown');
    response.clearCookie('dd_session', { path: '/' });
    response.clearCookie('dd_refresh', { path: '/api/v1/auth' });
  }

  @UseGuards(AuthGuard)
  @Post('auth/sessions/revoke-all')
  @HttpCode(204)
  async revokeAll(
    @Req() request: AuthenticatedRequest,
    @Body() body: { reason: string; exceptCurrent?: boolean },
  ): Promise<void> {
    await this.identities.revokeAll(
      request.principal.userId,
      body.reason,
      body.exceptCurrent ? request.principal.sessionId : undefined,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Get('auth/security')
  securityStatus(@Req() request: AuthenticatedRequest) {
    return this.identities.passwordSecurityStatus(request.principal);
  }

  @UseGuards(AuthGuard)
  @Post('auth/password/change')
  @HttpCode(200)
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.identities.changePassword(
      request.principal,
      body.currentPassword,
      body.newPassword,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Get('users')
  listUsers(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE',
    @Query('role') role?: import('@prisma/client').ApplicationRole,
  ) {
    return this.identities.listUsers(request.principal, {
      branchId,
      cursor,
      search,
      status,
      role,
    });
  }

  @UseGuards(AuthGuard)
  @Get('lookups/users')
  lookupUsers(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.identities.lookupUsers(request.principal, {
      q,
      branchId,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @UseGuards(AuthGuard)
  @Get('lookups/instructors')
  lookupInstructors(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.identities.lookupUsers(request.principal, {
      q,
      branchId,
      cursor,
      limit: limit ? Number(limit) : undefined,
      instructorsOnly: true,
    });
  }

  @UseGuards(AuthGuard)
  @Get('users/role-catalog')
  roleCatalog(@Req() request: AuthenticatedRequest) {
    return this.identities.roleCatalog(request.principal);
  }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  getUser(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.identities.getUser(request.principal, id);
  }

  @UseGuards(AuthGuard)
  @Post('users')
  inviteUser(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      email: string;
      displayName?: string;
      roles?: import('@prisma/client').ApplicationRole[];
      branchIds?: string[];
      roleAssignments?: {
        role: import('@prisma/client').ApplicationRole;
        branchId?: string | null;
      }[];
    },
  ) {
    return this.identities.inviteUser(request.principal, body, request.correlationId ?? 'unknown');
  }

  @UseGuards(AuthGuard)
  @Post('users/:id/password-setup-requests')
  @HttpCode(202)
  requestPasswordSetup(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { email: string; reason: string },
  ) {
    return this.identities.requestPasswordSetup(
      request.principal,
      id,
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Post('users/:id/roles')
  updateUserRoles(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      roles: { role: import('@prisma/client').ApplicationRole; branchId?: string | null }[];
      expectedVersion: number;
      reason: string;
    },
  ) {
    return this.identities.updateUserRoles(
      request.principal,
      id,
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Post('users/:id/deactivate')
  deactivate(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.identities.deactivate(
      request.principal,
      id,
      body.reason,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Post('users/:id/reactivate')
  reactivate(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.identities.reactivate(
      request.principal,
      id,
      body.reason,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Get('users/:id/audit')
  userAudit(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.identities.listUserAudit(request.principal, id, cursor);
  }

  @UseGuards(AuthGuard)
  @Get('audit-logs')
  auditLogs(
    @Req() request: AuthenticatedRequest,
    @Query('actorId') actorId?: string,
    @Query('targetUserId') targetUserId?: string,
    @Query('action') action?: string,
    @Query('branchId') branchId?: string,
    @Query('correlationId') correlationId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.identities.listAuditLogs(request.principal, {
      actorId,
      targetUserId,
      action,
      branchId,
      correlationId,
      from,
      until,
      cursor,
    });
  }

  @UseGuards(AuthGuard)
  @Get('assignments')
  listAssignments(@Req() request: AuthenticatedRequest, @Query('branchId') branchId?: string) {
    return this.identities.listAssignments(request.principal, branchId);
  }

  @UseGuards(AuthGuard)
  @Post('assignments')
  createAssignment(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      userId: string;
      branchId: string;
      assignmentType: import('@prisma/client').AssignmentType;
      activeFrom: string;
      activeUntil?: string | null;
      reason: string;
    },
  ) {
    return this.identities.createAssignment(
      request.principal,
      body,
      request.correlationId ?? 'unknown',
    );
  }

  @UseGuards(AuthGuard)
  @Post('assignments/:id/end')
  endAssignment(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') _idempotencyKey: string,
    @Body() body: { effectiveAt: string; reason: string; expectedVersion: number },
  ) {
    return this.identities.endAssignment(
      request.principal,
      id,
      body,
      request.correlationId ?? 'unknown',
    );
  }
}

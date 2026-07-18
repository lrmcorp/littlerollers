import {
  Body,
  Controller,
  Get,
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
import { configurationRequired } from './security';

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
    const { webCookieToken: _private, ...body } = session;
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

  @Post('auth/otp/requests')
  @HttpCode(202)
  requestOtp(@Body() body: { phoneE164: string }) {
    return this.identities.requestOtp(body.phoneE164);
  }

  @Post('auth/otp/verifications')
  async verifyOtp(
    @Res({ passthrough: true }) response: Response,
    @Body() body: { requestId: string; code: string },
  ) {
    return this.deliverSession(
      response,
      await this.identities.verifyOtp(body.requestId, body.code),
    );
  }

  @Post('auth/refresh')
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authorization = request.header('authorization') ?? '';
    const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(authorization);
    if (!match) return configurationRequired();
    return this.deliverSession(response, await this.identities.refresh(match[1]!));
  }

  @Post('auth/recovery-requests')
  requestRecovery(
    @Body()
    body: {
      identifier: string;
      requestedChannel: 'WHATSAPP' | 'GOOGLE' | 'SUPPORT';
    },
  ) {
    return this.identities.requestRecovery(body.identifier, body.requestedChannel);
  }

  @Post('auth/recoveries/:id/verify')
  async verifyRecovery(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { proof: string },
  ) {
    return this.deliverSession(response, await this.identities.verifyRecovery(id, body.proof));
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
    return this.identities.me(request.principal.userId);
  }

  @UseGuards(AuthGuard)
  @Post('auth/logout')
  @HttpCode(204)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.identities.logout(request.principal.sessionId);
    response.clearCookie('dd_session', { path: '/' });
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
    );
  }

  @UseGuards(AuthGuard)
  @Post('auth/mfa/challenges')
  createMfa(@Req() request: AuthenticatedRequest, @Body() body: { purpose: string }) {
    return this.identities.createMfa(request.principal, body.purpose);
  }

  @UseGuards(AuthGuard)
  @Post('auth/mfa/verifications')
  async verifyMfa(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { challengeId: string; proof: string },
  ) {
    return this.deliverSession(
      response,
      await this.identities.verifyMfa(request.principal, body.challengeId, body.proof),
    );
  }

  @UseGuards(AuthGuard)
  @Get('users')
  listUsers(@Req() request: AuthenticatedRequest, @Query('branchId') branchId?: string) {
    return this.identities.listUsers(request.principal, branchId);
  }

  @UseGuards(AuthGuard)
  @Post('users')
  inviteUser(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      email: string;
      roles: import('@prisma/client').ApplicationRole[];
      branchIds?: string[];
    },
  ) {
    return this.identities.inviteUser(request.principal, body, request.correlationId ?? 'unknown');
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
}

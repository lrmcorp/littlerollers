import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { SessionChannel } from '@prisma/client';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { IdentityService } from './identity.service';
import { configurationRequired } from './security';

@Controller()
export class IdentityController {
  constructor(private readonly identities: IdentityService) {}

  @Post('auth/google')
  authenticateGoogle(@Body() body: { idToken: string; nonce: string; channel: SessionChannel }) {
    return this.identities.authenticateGoogle(body);
  }

  @Post('auth/otp/requests')
  @HttpCode(202)
  async requestOtp(@Body() body: { phoneE164: string }): Promise<void> {
    await this.identities.requestOtp(body.phoneE164);
  }

  @Post('auth/otp/verifications')
  verifyOtp(@Body() body: { requestId: string; code: string }) {
    return this.identities.verifyOtp(body.requestId, body.code);
  }

  @Post('auth/refresh')
  refresh(@Req() request: AuthenticatedRequest) {
    const authorization = request.header('authorization') ?? '';
    const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(authorization);
    if (!match) return configurationRequired();
    return this.identities.refresh(match[1]!);
  }

  @Post('auth/recovery-requests')
  requestRecovery(): never {
    return configurationRequired();
  }

  @Post('auth/recoveries/:id/verify')
  verifyRecovery(): never {
    return configurationRequired();
  }

  @Post('auth/account-links')
  linkIdentity(): never {
    return configurationRequired();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.identities.me(request.principal.userId);
  }

  @UseGuards(AuthGuard)
  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.identities.logout(request.principal.sessionId);
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
  createMfa(): never {
    return configurationRequired();
  }

  @UseGuards(AuthGuard)
  @Post('auth/mfa/verifications')
  verifyMfa(): never {
    return configurationRequired();
  }

  @UseGuards(AuthGuard)
  @Get('users')
  listUsers(@Req() request: AuthenticatedRequest, @Query('branchId') branchId?: string) {
    return this.identities.listUsers(request.principal, branchId);
  }

  @UseGuards(AuthGuard)
  @Post('users')
  inviteUser(): never {
    return configurationRequired();
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

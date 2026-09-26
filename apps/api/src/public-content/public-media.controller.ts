import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../identity/route-access';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { PolicyService } from '../identity/policy.service';
import { PublicMediaService } from './public-media.service';

@Controller()
export class PublicMediaController {
  constructor(
    private readonly mediaService: PublicMediaService,
    private readonly policy: PolicyService,
  ) {}

  @Post('public-content-management/media-uploads')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      filename: string;
      mimeType: string;
      contentBase64: string;
    },
  ) {
    const hasPermission =
      req.principal.capabilities.includes('public-content:manage') ||
      req.principal.capabilities.includes('master:manage');
    if (!hasPermission) {
      this.policy.requireCapability(req.principal.capabilities, 'public-content:manage');
    }
    return this.mediaService.savePublicImage(body);
  }

  @Public()
  @Get('public-media/:filename')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async serveMedia(@Param('filename') filename: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.mediaService.getPublicImage(filename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Get('public-content-management/media')
  @UseGuards(AuthGuard)
  async listMedia(@Req() req: AuthenticatedRequest) {
    const hasPermission =
      req.principal.capabilities.includes('public-content:manage') ||
      req.principal.capabilities.includes('master:manage') ||
      req.principal.capabilities.includes('master:read');
    if (!hasPermission) {
      this.policy.requireCapability(req.principal.capabilities, 'master:read');
    }
    const items = await this.mediaService.listMedia();
    return { items };
  }
}

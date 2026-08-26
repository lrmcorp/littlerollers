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
    this.policy.requireCapability(req.principal.capabilities, 'public-content:manage');
    return this.mediaService.savePublicImage(body);
  }

  @Get('public-media/:filename')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  serveMedia(@Param('filename') filename: string, @Res() res: Response) {
    const { buffer, mimeType } = this.mediaService.getPublicImage(filename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}

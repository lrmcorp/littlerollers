import { Controller, Get, Header } from '@nestjs/common';
import { PublicSiteConfigService } from './public-site-config.service';

@Controller('public/site-config')
export class PublicSiteConfigController {
  constructor(private readonly siteConfig: PublicSiteConfigService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
  get() {
    return this.siteConfig.get();
  }
}

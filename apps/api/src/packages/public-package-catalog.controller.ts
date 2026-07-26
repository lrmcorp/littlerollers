import { Controller, Get, Query } from '@nestjs/common';
import { PublicPackageCatalogService } from './public-package-catalog.service';

@Controller('public/package-catalog')
export class PublicPackageCatalogController {
  constructor(private readonly catalog: PublicPackageCatalogService) {}

  @Get()
  list(@Query('branchId') branchId?: string) {
    return this.catalog.list(branchId);
  }
}

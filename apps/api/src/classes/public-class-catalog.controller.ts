import { Controller, Get, Query } from '@nestjs/common';
import { PublicClassCatalogService } from './public-class-catalog.service';

@Controller('public/class-catalog')
export class PublicClassCatalogController {
  constructor(private readonly catalog: PublicClassCatalogService) {}

  @Get()
  list(
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
  ) {
    return this.catalog.list({ branchId, from, until });
  }
}

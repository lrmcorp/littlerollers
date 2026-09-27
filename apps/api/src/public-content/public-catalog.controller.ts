import { Public } from '../identity/route-access';
import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { PublicClassQueryService } from './public-class-query.service';
import { PublicPackageQueryService } from './public-package-query.service';
import { PublicScheduleQueryService } from './public-schedule-query.service';
import { PublicStudioQueryService } from './public-studio-query.service';

@Public()
@Controller(['public/package-catalog', 'public/packages'])
export class PublicPackageCatalogController {
  constructor(private readonly packages: PublicPackageQueryService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
  list(@Query('branchId') branchId?: string) {
    return this.packages.list(branchId);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
  detail(@Param('id') id: string, @Query('branchId') branchId?: string) {
    return this.packages.detail(id, branchId);
  }
}

@Public()
@Controller(['public/class-catalog', 'public/classes/schedule'])
export class PublicScheduleCatalogController {
  constructor(private readonly schedules: PublicScheduleQueryService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
  ) {
    return this.schedules.list({ branchId, from, until });
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  detail(@Param('id') id: string) {
    return this.schedules.detail(id);
  }
}

@Public()
@Controller('public')
export class PublicProfileController {
  constructor(
    private readonly classes: PublicClassQueryService,
    private readonly studios: PublicStudioQueryService,
  ) {}

  @Get(['class-types/:slug', 'classes/:slug'])
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
  classDetail(@Param('slug') slug: string) {
    return this.classes.detail(slug);
  }

  @Get(['studios/:slug', 'branches/:slug'])
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
  studioDetail(@Param('slug') slug: string) {
    return this.studios.detail(slug);
  }
}

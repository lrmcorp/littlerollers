import { Injectable, Optional } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { MasterCatalogService } from './master-catalog.service';
import { MasterAccessService } from './master-access.service';

export type PublicProfileInput = {
  expectedVersion?: number;
  reason?: string;
  [key: string]: unknown;
};

@Injectable()
export class PublicProfileAdminService {
  private readonly catalog: MasterCatalogService;

  constructor(
    catalogOrDb: MasterCatalogService,
    @Optional() access?: MasterAccessService,
  ) {
    if (catalogOrDb && typeof (catalogOrDb as any).updatePublicProfile === 'function') {
      this.catalog = catalogOrDb;
    } else {
      this.catalog = new MasterCatalogService(catalogOrDb as any, access as any);
    }
  }

  list(principal: SessionPrincipal, branchId: string) {
    return this.catalog.listPublicProfiles(principal, branchId);
  }

  update(
    principal: SessionPrincipal,
    kind: 'branch' | 'class' | 'package',
    id: string,
    input: PublicProfileInput,
    correlationId: string,
  ) {
    return this.catalog.updatePublicProfile(principal, kind, id, input, correlationId);
  }
}

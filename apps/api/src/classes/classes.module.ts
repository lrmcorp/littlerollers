import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { ClassSlotController } from './class-slot.controller';
import { ClassSlotService } from './class-slot.service';
import { PublicClassCatalogController } from './public-class-catalog.controller';
import { PublicClassCatalogService } from './public-class-catalog.service';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [AvailabilityController, ClassSlotController, PublicClassCatalogController],
  providers: [AvailabilityService, ClassSlotService, PublicClassCatalogService],
})
export class ClassesModule {}

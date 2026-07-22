import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { ClassSlotController } from './class-slot.controller';
import { ClassSlotService } from './class-slot.service';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [AvailabilityController, ClassSlotController],
  providers: [AvailabilityService, ClassSlotService],
})
export class ClassesModule {}

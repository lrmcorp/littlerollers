import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FoundationModule } from '../foundation/foundation.module';
import { IdentityModule } from '../identity/identity.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

@Module({
  imports: [DatabaseModule, FoundationModule, IdentityModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class ClassesModule {}

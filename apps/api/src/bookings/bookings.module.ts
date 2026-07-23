import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ReschedulesController } from './reschedules.controller';
import { ReschedulesService } from './reschedules.service';

@Module({
  controllers: [BookingsController, ReschedulesController],
  providers: [BookingsService, ReschedulesService],
})
export class BookingsModule {}

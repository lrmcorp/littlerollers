import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { Roles } from '../identity/roles.decorator';
import { RolesGuard } from '../identity/roles.guard';
import { AutoCancelService } from '../classes/auto-cancel.service';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { ReminderScheduleService } from './reminder-schedule.service';

@Controller('operations')
@UseGuards(AuthGuard, RolesGuard)
export class OperationsAutomationController {
  constructor(
    private readonly autoCancel: AutoCancelService,
    private readonly whatsapp: WhatsAppGatewayService,
    private readonly reminderSchedule: ReminderScheduleService,
  ) {}

  /**
   * Memicu evaluasi pembatalan otomatis kelas kurang kuota pada H-24 (Keputusan Bisnis #4 & #5)
   */
  @Post('auto-cancel/evaluate')
  @Roles('SUPER_OWNER', 'OWNER', 'MANAGER', 'ADMIN')
  async evaluateAutoCancel(@Req() _req: AuthenticatedRequest) {
    const result = await this.autoCancel.evaluateClasses();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Memicu evaluasi pengingat berjenjang WhatsApp (Keputusan Bisnis #11, #12, #13)
   */
  @Post('reminders/evaluate-batch')
  @Roles('SUPER_OWNER', 'MANAGER', 'ADMIN')
  async evaluateRemindersBatch(@Req() _req: AuthenticatedRequest) {
    const result = await this.reminderSchedule.runAllReminders();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Mengambil riwayat pengiriman pesan WhatsApp (ReminderLog)
   */
  @Get('reminders/logs')
  @Roles('SUPER_OWNER', 'OWNER', 'MANAGER', 'ADMIN', 'FINANCE')
  async listReminderLogs(
    @Req() _req: AuthenticatedRequest,
    @Query('phone') phone?: string,
    @Query('reminderType') reminderType?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.whatsapp.listLogs({
      phone,
      reminderType,
      status,
      limit: limit ? Number(limit) : 50,
    });
    return {
      success: true,
      data: logs,
    };
  }

  /**
   * Ringkasan statistik pengiriman pengingat & otomasi
   */
  @Get('reminders/summary')
  @Roles('SUPER_OWNER', 'OWNER', 'MANAGER', 'ADMIN', 'FINANCE')
  async getRemindersSummary(@Req() _req: AuthenticatedRequest) {
    const recentLogs = await this.whatsapp.listLogs({ limit: 100 });
    const sentCount = recentLogs.filter((l) => l.status === 'SENT').length;
    const failedCount = recentLogs.filter((l) => l.status === 'FAILED').length;

    return {
      success: true,
      data: {
        totalRecentSent: sentCount,
        totalRecentFailed: failedCount,
        lastSentAt: recentLogs[0]?.sentAt ?? null,
      },
    };
  }
}

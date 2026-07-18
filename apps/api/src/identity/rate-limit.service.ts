import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from './security';

@Injectable()
export class RateLimitService {
  constructor(private readonly db: PrismaService) {}

  async consume(scope: string, subjectHash: string, limit = 5, windowSeconds = 900): Promise<void> {
    const windowMs = windowSeconds * 1000;
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
    const counter = await this.db.rateLimitCounter.upsert({
      where: { scope_subjectHash_windowStart: { scope, subjectHash, windowStart } },
      create: {
        scope,
        subjectHash,
        windowStart,
        expiresAt: new Date(windowStart.getTime() + windowMs),
      },
      update: { attempts: { increment: 1 } },
    });
    if (counter.attempts > limit)
      throw new ApiProblem('RATE_LIMITED', HttpStatus.TOO_MANY_REQUESTS, true);
  }
}

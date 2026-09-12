import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from './security';

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

@Injectable()
export class RateLimitService {
  constructor(private readonly db: PrismaService) {}

  async consume(scope: string, subjectHash: string, limit = 5, windowSeconds = 900): Promise<void> {
    const key = `${scope}:${subjectHash}`;
    const now = Date.now();
    const existing = rateLimitMap.get(key);

    if (!existing || existing.expiresAt <= now) {
      rateLimitMap.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return;
    }

    existing.count += 1;
    if (existing.count > limit) {
      throw new ApiProblem('RATE_LIMITED', HttpStatus.TOO_MANY_REQUESTS, true);
    }
  }
}

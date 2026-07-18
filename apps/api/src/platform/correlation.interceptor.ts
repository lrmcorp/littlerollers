import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import type { Observable } from 'rxjs';

export const CORRELATION_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { correlationId?: string }>();
    const response = context.switchToHttp().getResponse<Response>();
    const candidate = request.header(CORRELATION_HEADER)?.trim();
    const correlationId = candidate && candidate.length <= 128 ? candidate : randomUUID();
    request.correlationId = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);
    return next.handle();
  }
}

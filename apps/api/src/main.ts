import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorrelationInterceptor } from './platform/correlation.interceptor';
import { ProblemDetailsFilter } from './platform/problem-details.filter';
import type { NextFunction, Request, Response } from 'express';
import { raw } from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(
    '/api/v1/uploads/payment-proofs/:id/content',
    raw({ type: 'application/octet-stream', limit: '12mb' }),
  );
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      process.env.NODE_ENV === 'production'
    ) {
      const configured = process.env.PUBLIC_WEB_BASE_URL?.trim();
      const expectedOrigin = configured ? new URL(configured).origin : null;
      const origin = request.header('origin');
      if (!expectedOrigin || origin !== expectedOrigin)
        return response.status(403).json({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          code: 'ORIGIN_REJECTED',
        });
    }
    next();
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new CorrelationInterceptor());
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.listen(Number(process.env.PORT ?? 3001));
}
void bootstrap();

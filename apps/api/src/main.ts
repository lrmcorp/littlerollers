import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorrelationInterceptor } from './platform/correlation.interceptor';
import { ProblemDetailsFilter } from './platform/problem-details.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new CorrelationInterceptor());
  app.useGlobalFilters(new ProblemDetailsFilter());
  await app.listen(Number(process.env.PORT ?? 3001));
}
void bootstrap();

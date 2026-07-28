import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiProblem } from '../identity/security';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { correlationId?: string }>();
    const response = http.getResponse<Response>();
    const status =
      error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const code =
      error instanceof ApiProblem
        ? error.code
        : error instanceof HttpException
          ? `HTTP_${status}`
          : 'INTERNAL_ERROR';
    response
      .status(status)
      .type('application/problem+json')
      .send({
        error: {
          code,
          message:
            status >= 500 ? 'Terjadi kesalahan internal.' : 'Permintaan tidak dapat diproses.',
          correlationId: request.correlationId ?? 'unknown',
          details: error instanceof ApiProblem ? error.details : [],
          retryable: error instanceof ApiProblem ? error.retryable : status >= 500,
        },
      });
  }
}

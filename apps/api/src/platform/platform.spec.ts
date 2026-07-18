import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';

describe('correlation foundation', () => {
  it('propagates a safe caller correlation id to request and response', () => {
    const request = { header: jest.fn().mockReturnValue('correlation-123') };
    const response = { setHeader: jest.fn() };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    };
    new CorrelationInterceptor().intercept(context as never, { handle: () => of(null) });
    expect(request).toHaveProperty('correlationId', 'correlation-123');
    expect(response.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'correlation-123');
  });
});

import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule Bootstrap Smoke Test', () => {
  it('seluruh modul, service, dan provider NestJS harus ter-resolve tanpa error dependency injection', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});

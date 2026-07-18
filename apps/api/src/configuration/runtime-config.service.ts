import { Injectable } from '@nestjs/common';
import { loadRuntimeConfig, type RuntimeConfig } from '@dailydose/config';

@Injectable()
export class RuntimeConfigService {
  readonly value: RuntimeConfig;
  constructor() {
    this.value = loadRuntimeConfig(process.env);
  }
}

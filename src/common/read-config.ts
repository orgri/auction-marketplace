import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ReadConfig {
  private config: ConfigService;

  constructor(envFile?: string) {
    if (!fs.existsSync(envFile)) envFile = '.env';
    const env = dotenv.parse(fs.readFileSync(envFile));

    this.config = new ConfigService(env);
  }

  getString(key: string): string {
    return this.config.get<string>(key);
  }

  getInt(key: string): number {
    const val = this.config.get<string>(key);
    return val ? parseInt(val) : undefined;
  }

  getBoolean(key: string): boolean {
    const val = this.config.get<string>(key);
    return val ? JSON.parse(val) : false;
  }
}

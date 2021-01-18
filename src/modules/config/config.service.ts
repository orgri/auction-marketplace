import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { BullModuleOptions } from '@nestjs/bull';
import { JwtModuleOptions } from '@nestjs/jwt';

export interface IEnvConfig {
  [key: string]: string;
}

const dbDir = path.relative(
  process.cwd(),
  path.resolve(`${__dirname}/../../db`),
);
const templatesDir = path.resolve(__dirname, 'templates');

@Injectable()
export class ConfigService {
  private static serviceInstance: ConfigService;
  private readonly logger = new Logger(ConfigService.name);
  private readonly envConfig: IEnvConfig;

  constructor(filePath?: string) {
    ConfigService.serviceInstance = this;

    if (!fs.existsSync(filePath)) filePath = '.env';

    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.ensureValues(config);

    this.logger.log(
      `Configuration file "${filePath}" has been read successfully`,
    );
  }

  public static get instance() {
    return ConfigService.serviceInstance;
  }

  public getPort(): number {
    return this.getInt('PORT');
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return <TypeOrmModuleOptions>{
      name: 'default',
      type: 'postgres',
      host: this.getString('POSTGRES_HOST'),
      port: this.getInt('POSTGRES_PORT'),
      username: this.getString('POSTGRES_USER'),
      password: this.getString('POSTGRES_PASSWORD'),
      database: this.getString('POSTGRES_DATABASE'),
      entities: [`${dbDir}/models/**/*.entity{.ts,.js}`],
      migrationsTableName: 'migration',
      migrations: [`${dbDir}/migrations/*.ts`],
      cli: {
        migrationsDir: `${dbDir}/migrations`,
      },
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  public getSeedsConfig() {
    return {
      seeds: [`${dbDir}/seeds/**/*.seed{.ts,.js}`],
      factories: [`${dbDir}/factories/**/*{.ts,.js}`],
    };
  }

  public getJwtConfig(): JwtModuleOptions {
    return <JwtModuleOptions>{
      secret: this.getString('AUTH_JWT_SECRET'),
      signOptions: {
        expiresIn: this.getString('AUTH_JWT_EXPIRES_IN'),
      },
    };
  }

  public getMailConfig(): MailerOptions {
    return <MailerOptions>{
      transport: {
        host: this.getString('MAIL_HOST'),
        port: this.getString('MAIL_PORT'),
        secure: this.getBoolean('MAIL_SECURE'),
        // tls: { ciphers: 'SSLv3' }, // gmail
        auth: {
          user: this.getString('MAIL_USER'),
          pass: this.getString('MAIL_PASS'),
        },
        logger: this.getBoolean('MAIL_LOGGER'),
      },
      defaults: {
        from: `"Auction Team" <${this.getString('MAIL_FROM')}>`,
      },
      template: {
        dir: templatesDir,
        adapter: new EjsAdapter(),
        options: {
          strict: false,
        },
      },
    };
  }

  public getRedisConfig(): BullModuleOptions {
    return <BullModuleOptions>{
      redis: {
        host: this.getString('REDIS_HOST'),
        port: this.getInt('REDIS_PORT'),
      },
    };
  }

  public getString(key: string): string {
    return this.get(key);
  }

  public getInt(key: string): number {
    const val = this.get(key);
    return val ? parseInt(val) : undefined;
  }

  public getBoolean(key: string): boolean {
    const val = this.get(key);
    return val ? JSON.parse(val) : false;
  }

  private get(key: string): string {
    return this.envConfig[key];
  }

  private ensureValues(envConfig: IEnvConfig): IEnvConfig {
    for (const key in envConfig) {
      if (!envConfig[key]) {
        throw new Error(`Config error - missing value for "${key}"`);
      }
    }

    return envConfig;
  }
}

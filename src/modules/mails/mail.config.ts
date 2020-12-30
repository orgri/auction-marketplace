import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

const templatesDir = path.resolve(__dirname, 'templates');
const env = dotenv.parse(fs.readFileSync('.env'));
const configService = new ConfigService(env);

module.exports = {
  transport: {
    host: configService.get('MAIL_HOST'),
    port: configService.get('MAIL_PORT'),
    secure: configService.get<boolean>('MAIL_SECURE', false),
    // tls: { ciphers: 'SSLv3' }, // gmail
    auth: {
      user: configService.get('MAIL_USER'),
      pass: configService.get('MAIL_PASS'),
    },
    logger: true,
  },
  defaults: {
    from: `"Auction Team" <${configService.get('MAIL_FROM')}>`,
  },
  template: {
    dir: templatesDir,
    adapter: new EjsAdapter(),
    options: {
      strict: false,
    },
  },
};

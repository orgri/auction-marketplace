import * as path from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ReadConfig } from '../../common/read-config';

const templatesDir = path.resolve(__dirname, 'templates');
const config = new ReadConfig();

export const MailConfig = {
  transport: {
    host: config.getString('MAIL_HOST'),
    port: config.getString('MAIL_PORT'),
    secure: config.getBoolean('MAIL_SECURE'),
    // tls: { ciphers: 'SSLv3' }, // gmail
    auth: {
      user: config.getString('MAIL_USER'),
      pass: config.getString('MAIL_PASS'),
    },
    logger: config.getBoolean('MAIL_LOGGER'),
  },
  defaults: {
    from: `"Auction Team" <${config.getString('MAIL_FROM')}>`,
  },
  template: {
    dir: templatesDir,
    adapter: new EjsAdapter(),
    options: {
      strict: false,
    },
  },
};

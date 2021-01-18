import { ConfigService } from './src/modules/config';

const cfg = new ConfigService();

export = { ...cfg.getTypeOrmConfig(), ...cfg.getSeedsConfig() };

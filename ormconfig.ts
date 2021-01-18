import { ConfigService } from './src/modules/config';

const cfg = ConfigService.instance;

export = { ...cfg.getTypeOrmConfig(), ...cfg.getSeedsConfig() };

import { Module } from '@nestjs/common';
import { commonModules, controllerModules } from './modules';

@Module({
  imports: [...commonModules, ...controllerModules],
  controllers: [],
  providers: [],
})
export class AppModule {}

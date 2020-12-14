import { LotModule } from './modules/lot/lot.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, LotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

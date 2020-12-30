import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '../mails/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('AUTH_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('AUTH_JWT_EXPIRES_IN'),
        },
      }),
    }),
    UserModule,
    MailModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

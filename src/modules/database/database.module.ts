import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        // entities: ['/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        // migrationsTableName: 'migration',
        // migrations: ['src/migration/*.ts'],

        // cli: {
        //   migrationsDir: 'src/migration',
        // },
        namingStrategy: new SnakeNamingStrategy(),
        // ssl: true,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}

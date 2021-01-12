import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

jest.mock('../../src/modules/tasks/queue.service');
jest.mock('../../src/modules/mails/mail.service');
jest.mock('../../src/modules/websockets/websockets.gateway');

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(false);
  await app.init();

  return app;
}

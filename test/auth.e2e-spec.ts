import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

const user = {
  firstName: 'E2e Test',
  lastName: 'User',
  email: 'e2e_user@example.com',
  phone: '+380950000000',
  birth: '1999-01-01',
};

const password = 'password';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup POST', () => {
    it('should return correct user data', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...user, password })
        .expect(201);

      expect(res.body).toEqual({
        ...user,
        id: res.body.id,
        createdAt: res.body.createdAt,
      });
    });

    it('should return validation error because of birth constarint', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...user, password, birth: '2020-01-01' })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['You are must be 21 years old'],
        });
    });

    it('should return validation error because of missing prequired data', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'email must be an email',
            'email should not be empty',
            'email must be shorter than or equal to 30 characters',
            'password must be longer than or equal to 8 characters',
            'password should not be empty',
            'firstName should not be empty',
            'lastName should not be empty',
            'phone must be a valid phone number',
            'phone should not be empty',
            'birth should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('should return validation error because of unique email constarint', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...user, password })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['You are not able to register'],
        });
    });

    it('should return validation error because of unique phone constarint', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...user, password, email: 'differ_user@example.com' })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['You are not able to register'],
        });
    });
  });
});

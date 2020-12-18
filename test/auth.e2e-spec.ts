import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';

const user = {
  firstName: 'E2e Test',
  lastName: 'User',
  email: 'e2e_user@example.com',
  phone: '+380950000000',
  birth: '1999-01-01',
};
const password = 'password';
const newPassword = 'e2epassword';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    accessToken = app.get<JwtService>(JwtService).sign({ email: user.email });
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

    it('should return error because of birth constraint', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...user, password, birth: '2020-01-01' })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['You are must be 21 years old'],
        });
    });

    it('should return error because of missing required data', () => {
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

    it('should return error because of unique email constraint', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...user, password })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['You are not able to register'],
        });
    });

    it('should return error because of unique phone constraint', () => {
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

  describe('/auth/login POST', () => {
    it('should not login with incorect password ', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: 'incorrect' })
        .expect(422)
        .expect({
          statusCode: 422,
          message: 'Wrong email or password',
          error: 'Unprocessable Entity',
        });
    });

    it('should not login with incorect email ', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'incorrect@email.com', password })
        .expect(422)
        .expect({
          statusCode: 422,
          message: 'Wrong email or password',
          error: 'Unprocessable Entity',
        });
    });

    it('should login and return user data with token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password })
        .expect(200);

      expect(res.body).toEqual({
        accessToken: res.body.accessToken,
        user: {
          ...user,
          id: res.body.user.id,
          createdAt: res.body.user.createdAt,
        },
      });
    });
  });

  describe('/auth/forgot-password POST', () => {
    it('should return message for correct email', async () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: user.email })
        .expect(200)
        .expect({
          message: 'Check your email to change password',
        });
    });

    it('should return message for incorrect email', async () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'incorrect@email.com' })
        .expect(200)
        .expect({
          message: 'Check your email to change password',
        });
    });
  });

  describe('/auth/change-password POST', () => {
    it('should change password and return user data with token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ password: newPassword, repeatPassword: newPassword })
        .expect(200);

      expect(res.body).toEqual({
        accessToken: res.body.accessToken,
        user: {
          ...user,
          id: res.body.user.id,
          createdAt: res.body.user.createdAt,
        },
      });
    });

    it('should login after change password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: newPassword })
        .expect(200);
    });

    it('should not permit change without auth token', async () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({ email: user.email })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });

    it('should return error about incorrect data', async () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ password: newPassword, repeatPassword: 'incorrect' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Incorrect repeatPassword',
          error: 'Bad Request',
        });
    });
  });
});

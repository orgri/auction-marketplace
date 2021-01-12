import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/db/models';

const email = 'user10@example.com';
const id = 10;

const changedUser = {
  firstName: 'E2E Update',
  lastName: 'User',
  email,
  phone: '+380950000010',
  birth: '1999-01-01',
};

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userRepo: Repository<User>;
  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture
      .createNestApplication()
      .useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userRepo = app.get('UserRepository');
    accessToken = app.get<JwtService>(JwtService).sign({ email, id });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users/profile GET', () => {
    it('should return user with correct data', async () => {
      user = await userRepo.findOne({ email });

      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200);

      expect(res.body).toEqual({
        ...user,
        createdAt: user.createdAt.toJSON(),
      });
    });
  });

  describe('/users/profile PATCH', () => {
    it('should return user with correct data', async () => {
      user = await userRepo.findOne({ email });

      const res = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(changedUser)
        .expect(200);

      expect(res.body).toEqual({
        ...changedUser,
        id,
        createdAt: user.createdAt.toJSON(),
      });
    });

    it('should return error because of birth constraint', async () => {
      return request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...changedUser, birth: '2020-01-01' })
        .expect(422)
        .expect({
          statusCode: 422,
          message: ['You are must be 21 years old'],
          error: 'Validation Error',
        });
    });

    it('should return error because of unique phone constraint', async () => {
      const { phone } = await userRepo.findOne({ id: 1 });

      return request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...changedUser, phone })
        .expect(422)
        .expect({
          statusCode: 422,
          message: ['You are not able to update user'],
          error: 'Validation Error',
        });
    });

    it('should return error because of unique email constraint', async () => {
      const { email } = await userRepo.findOne({ id: 1 });

      return request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...changedUser, email })
        .expect(422)
        .expect({
          statusCode: 422,
          message: ['You are not able to update user'],
          error: 'Validation Error',
        });
    });
  });
});

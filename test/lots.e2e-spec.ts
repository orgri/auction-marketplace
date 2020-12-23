import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { Not, Repository } from 'typeorm';
import { Lot, LotStatus } from '../src/db/models';
import { DateTime } from 'luxon';

const testLot = {
  title: 'E2E Test title',
  description: 'E2e test description',
  image: null,
  currentPrice: 1000.01,
  estimetedPrice: 5000.05,
  startAt: DateTime.local().plus({ days: 2 }).toJSON(),
  endAt: DateTime.local().plus({ weeks: 2 }).toJSON(),
};

const updateLot = {
  title: 'E2E Test title (updated)',
  description: 'E2e test description (updated)',
  image: '/path/to/image',
  currentPrice: 2000.02,
  estimetedPrice: 7000.07,
  startAt: DateTime.local().plus({ days: 4 }).toJSON(),
  endAt: DateTime.local().plus({ weeks: 4 }).toJSON(),
};

const email = 'user1@example.com';
const ownerId = 1;

describe('LotController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let lotRepo: Repository<Lot>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture
      .createNestApplication()
      .useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    lotRepo = app.get('LotRepository');
    accessToken = app.get<JwtService>(JwtService).sign({ email, id: ownerId });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/lots/all GET', () => {
    it('should return all lots with in_process status', async () => {
      const res = await request(app.getHttpServer())
        .get('/lots/all')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200);

      res.body.forEach((lot: Lot) => expect(lot.status).toBe('in_process'));
    });

    it('should return correct number of lots', async () => {
      const res = await request(app.getHttpServer())
        .get('/lots/all?page=7&limit=8')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200);

      expect(res.body).toHaveLength(2);
    });
  });

  describe('/lots/my GET', () => {
    it('should return only user lots', async () => {
      const res = await request(app.getHttpServer())
        .get('/lots/my')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ isOwned: true, isParticipated: false })
        .expect(200);

      res.body.forEach((lot: Lot) => expect(lot.ownerId).toBe(ownerId));
    });

    it('should return only participated lots', async () => {
      const res = await request(app.getHttpServer())
        .get('/lots/my')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ isOwned: false, isParticipated: true })
        .expect(200);

      res.body.forEach((lot: Lot) => expect(lot.ownerId).not.toBe(ownerId));
    });

    it('should return correct number of lots', async () => {
      const res = await request(app.getHttpServer())
        .get('/lots/my?page=2&limit=10')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ isOwned: true, isParticipated: false })
        .expect(200);

      expect(res.body).toHaveLength(5);
    });
  });

  describe('/lots/create POST', () => {
    it('should create Lot and return data', async () => {
      const res = await request(app.getHttpServer())
        .post('/lots/create')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(testLot)
        .expect(201);

      expect(res.body).toEqual({
        ...testLot,
        // currentPrice: testLot.currentPrice.toString(),
        // estimetedPrice: testLot.estimetedPrice.toString(),
        ownerId,
        currency: 'USD',
        status: LotStatus.pending,
        id: res.body.id,
        createdAt: res.body.createdAt,
      });
    });

    it('should return error because of missing required data', async () => {
      return request(app.getHttpServer())
        .post('/lots/create')
        .set('Authorization', 'Bearer ' + accessToken)
        .send()
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'title must be shorter than or equal to 300 characters',
            'title should not be empty',
            'currentPrice must be a positive number',
            'currentPrice should not be empty',
            'estimetedPrice must be a positive number',
            'estimetedPrice should not be empty',
            'startAt must be a ISOString',
            'startAt should not be empty',
            'endAt must be a ISOString',
            'endAt should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('should return error because of small estimatedPrice', async () => {
      const currentPrice = testLot.estimetedPrice + 1;

      return request(app.getHttpServer())
        .post('/lots/create')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...testLot, currentPrice })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['estimetedPrice must be grater than currentPrice'],
        });
    });

    it('should return error because of early startAt', async () => {
      const startAt = DateTime.local().minus({ days: 1 }).toJSON();

      return request(app.getHttpServer())
        .post('/lots/create')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...testLot, startAt })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['startAt must be later than current time'],
        });
    });

    it('should return error because of early endAt', async () => {
      const endAt = DateTime.local().toJSON();

      return request(app.getHttpServer())
        .post('/lots/create')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...testLot, endAt })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['endAt must be later than startAt'],
        });
    });
  });

  describe('/lots/:id/update PATCH', () => {
    let updateId: number;

    it('should update Lot and return data', async () => {
      ({ id: updateId } = await lotRepo.findOne({
        ownerId,
        status: LotStatus.pending,
      }));

      const res = await request(app.getHttpServer())
        .patch(`/lots/${updateId}/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateLot)
        .expect(200);

      expect(res.body).toEqual({
        ...updateLot,
        ownerId,
        id: updateId,
        currency: 'USD',
        status: LotStatus.pending,
        createdAt: res.body.createdAt,
      });
    });

    it('should return error because of small estimatedPrice', async () => {
      const currentPrice = updateLot.estimetedPrice + 1;

      return request(app.getHttpServer())
        .patch(`/lots/${updateId}/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...updateLot, currentPrice })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['estimetedPrice must be grater than currentPrice'],
        });
    });

    it('should return error because of early startAt', async () => {
      const startAt = DateTime.local().minus({ days: 1 }).toJSON();

      return request(app.getHttpServer())
        .patch(`/lots/${updateId}/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...updateLot, startAt })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['startAt must be later than current time'],
        });
    });

    it('should return error because of early endAt', async () => {
      const endAt = DateTime.local().toJSON();

      return request(app.getHttpServer())
        .patch(`/lots/${updateId}/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...updateLot, endAt })
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: ['endAt must be later than startAt'],
        });
    });

    it('should return error because of forbidden lot status', async () => {
      const { id } = await lotRepo.findOne({
        ownerId,
        status: LotStatus.inProcess,
      });

      return request(app.getHttpServer())
        .patch(`/lots/${id}/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateLot)
        .expect(422)
        .expect({
          name: 'Validation Error',
          errors: [
            `You are not able to update/delete a lot in "${LotStatus.inProcess}" status`,
          ],
        });
    });

    it('should return error because of forbidden lot', async () => {
      const { id } = await lotRepo.findOne({
        status: LotStatus.pending,
        ownerId: Not(1),
      });

      return request(app.getHttpServer())
        .patch(`/lots/${id}/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateLot)
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'Forbidden resourse!',
          error: 'Forbidden',
        });
    });
  });

  describe('/lots/:id/delete DELETE', () => {
    it('should delete Lot and return result', async () => {
      const { id } = await lotRepo.findOne({
        ownerId,
        status: LotStatus.pending,
      });

      return request(app.getHttpServer())
        .delete(`/lots/${id}/delete`)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .expect({ raw: [], affected: 1 });
    });
  });
});

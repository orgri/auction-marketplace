import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { Not, Repository } from 'typeorm';
import { Bid, Lot, LotStatus } from '../src/db/models';
import { createTestApp } from './utils/test.app';

const email = 'user1@example.com';
const ownerId = 1;

describe('LotController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let lotRepo: Repository<Lot>;
  let lot: Lot;

  beforeAll(async () => {
    app = await createTestApp();

    lotRepo = app.get('LotRepository');
    accessToken = app.get<JwtService>(JwtService).sign({ email, id: ownerId });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/lots/:id/bids GET', () => {
    it('should return lot with corresponding bids in correct order', async () => {
      lot = await lotRepo.findOne({
        ownerId,
        status: LotStatus.inProcess,
      });

      const res = await request(app.getHttpServer())
        .get(`/lots/${lot.id}/bids`)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200);

      expect(res.body.id).toBe(lot.id);
      expect(res.body.bids).toHaveLength(10);
      res.body.bids.forEach((bid: Bid) => expect(bid.lotId).toBe(lot.id));

      const isNextLargerThanPrev = (el, idx, arr) => {
        if (idx === 0) return true;
        if (idx > 0) return el.proposedPrice <= arr[--idx].proposedPrice;
      };

      expect(res.body.bids.every(isNextLargerThanPrev)).toBe(true);
    });

    it('should return lot with correct number of bids', async () => {
      const res = await request(app.getHttpServer())
        .get(`/lots/${lot.id}/bids?page=2&limit=10`)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200);

      expect(res.body.id).toBe(lot.id);
      expect(res.body.bids).toHaveLength(5);
      res.body.bids.forEach((bid: Bid) => expect(bid.lotId).toBe(lot.id));
    });
  });

  describe('/lots/:id/bids/create POST', () => {
    it('should not create Bid for owned lot', async () => {
      const proposedPrice = lot.estimetedPrice;

      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/bids/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ proposedPrice })
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'You cannot create/delete bid if you are owner of lot',
          error: 'Forbidden',
        });
    });

    it('should not create Bid for lot with lower proposedPrice than currentPrice', async () => {
      lot = await lotRepo.findOne({
        ownerId: Not(1),
        status: LotStatus.inProcess,
      });

      const proposedPrice = lot.currentPrice;

      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/bids/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ proposedPrice })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            'You are not able to create bid with equal or less proposedPrice than currentPrice',
          ],
          error: 'Validation Error',
        });
    });

    it('should not create Bid for pending lot', async () => {
      lot = await lotRepo.findOne({
        ownerId: Not(1),
        status: LotStatus.pending,
      });

      const proposedPrice = lot.currentPrice;

      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/bids/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ proposedPrice })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            'You are not able to create/delete bid for lot in "pending" status',
          ],
          error: 'Validation Error',
        });
    });

    it('should create Bid for lot and return data', async () => {
      lot = await lotRepo.findOne({
        ownerId: Not(1),
        status: LotStatus.inProcess,
      });

      const proposedPrice = lot.estimetedPrice - 0.1;

      const res = await request(app.getHttpServer())
        .post(`/lots/${lot.id}/bids/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ proposedPrice })
        .expect(201);

      expect(res.body).toEqual({
        proposedPrice,
        ownerId,
        lotId: lot.id,
        id: res.body.id,
        currentPrice: lot.currentPrice,
        createdAt: res.body.createdAt,
      });
    });

    it('should change lot currentPrice', async () => {
      const proposedPrice = lot.estimetedPrice;

      await request(app.getHttpServer())
        .post(`/lots/${lot.id}/bids/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ proposedPrice })
        .expect(201);

      const { currentPrice } = await lotRepo.findOne(lot.id);

      expect(currentPrice).toBe(proposedPrice);
    });

    it('should not create Bid for closed lot', async () => {
      const proposedPrice = lot.currentPrice + 100;

      await lotRepo.save({ id: lot.id, status: LotStatus.closed });

      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/bids/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ proposedPrice })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            'You are not able to create/delete bid for lot in "closed" status',
          ],
          error: 'Validation Error',
        });
    });
  });
});

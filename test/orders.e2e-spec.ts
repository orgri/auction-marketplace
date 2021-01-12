import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Bid, Lot, LotStatus, Order, OrderStatus } from '../src/db/models';
import { createTestApp } from './utils/test.app';

const orderBody = {
  arrivalLocation: 'E2E street',
  arrivalType: 'Royal Mail',
};

const changedOrderBody = {
  arrivalLocation: 'E2E street Changed',
  arrivalType: 'DHL Express',
};

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let lotOwnerAccessToken: string;
  let lotRepo: Repository<Lot>;
  let orderRepo: Repository<Order>;
  let lot: Lot;
  let winnerBid: Bid;
  let orderId: number;

  const getWinner = async (status: LotStatus, repo: Repository<Lot>) => {
    return repo
      .createQueryBuilder('lots')
      .leftJoinAndSelect('lots.owner', 'owner')
      .leftJoinAndSelect('lots.bids', 'bids')
      .leftJoinAndSelect('bids.owner', 'winner')
      .where('lots.status = :status AND bids.id IS NOT NULL', {
        status,
      })
      .groupBy('lots.id, owner.id, bids.id, winner.id')
      .orderBy('bids.proposed_price', 'DESC')
      .getOne();
  };

  beforeAll(async () => {
    app = await createTestApp();

    lotRepo = app.get('LotRepository');
    orderRepo = app.get('OrderRepository');

    lot = await getWinner(LotStatus.closed, lotRepo);
    winnerBid = lot.bids[0];
    accessToken = app
      .get<JwtService>(JwtService)
      .sign({ email: lot.bids[0].owner.email, id: lot.bids[0].owner.id });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/lots/:id/order/create POST', () => {
    it('should create Order for lot and return data', async () => {
      const res = await request(app.getHttpServer())
        .post(`/lots/${lot.id}/order/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...orderBody, bidId: winnerBid.id })
        .expect(201);

      expect(res.body).toEqual({
        ...orderBody,
        status: OrderStatus.pending,
        bidId: winnerBid.id,
        id: res.body.id,
        createdAt: res.body.createdAt,
      });
    });

    it('should not create few Orders for one lot', async () => {
      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/order/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...orderBody, bidId: winnerBid.id })
        .expect(422)
        .expect({
          statusCode: 422,
          message: ['You are not able to create an order'],
          error: 'Validation Error',
        });
    });

    it('should not create Order with invalid data', async () => {
      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/order/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'bidId must be an integer number',
            'bidId should not be empty',
            'arrivalLocation must be shorter than or equal to 1000 characters',
            'arrivalLocation should not be empty',
            'arrivalType must be a valid enum value',
            'arrivalType should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('should not create Order with incorrect bid', async () => {
      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/order/create`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...orderBody, bidId: 1 })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Bid with id: 1 is not winner of lot',
          error: 'Bad Request',
        });
    });

    it('should not create Order if user not winner', async () => {
      const notWinnerAccessToken = app
        .get<JwtService>(JwtService)
        .sign({ email: lot.owner.email, id: lot.owner.id });

      return request(app.getHttpServer())
        .post(`/lots/${lot.id}/order/create`)
        .set('Authorization', 'Bearer ' + notWinnerAccessToken)
        .send({ ...orderBody, bidId: winnerBid.id })
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'Forbidden resourse!',
          error: 'Forbidden',
        });
    });

    it('should not create Order for lot of incorrect status', async () => {
      const wrongLot = await getWinner(LotStatus.inProcess, lotRepo);
      const winnerAccessToken = app.get<JwtService>(JwtService).sign({
        email: wrongLot.bids[0].owner.email,
        id: wrongLot.bids[0].owner.id,
      });

      return request(app.getHttpServer())
        .post(`/lots/${wrongLot.id}/order/create`)
        .set('Authorization', 'Bearer ' + winnerAccessToken)
        .send({ ...orderBody, bidId: wrongLot.bids[0].id })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            `Posssible to create order only for lot in "${LotStatus.closed}" status`,
          ],
          error: 'Validation Error',
        });
    });
  });

  describe('/lots/:id/order GET', () => {
    it('should return Order data for lot', async () => {
      const res = await request(app.getHttpServer())
        .get(`/lots/${lot.id}/order`)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200);

      orderId = res.body.id;

      expect(res.body).toEqual({
        ...orderBody,
        status: OrderStatus.pending,
        bidId: winnerBid.id,
        id: orderId,
        createdAt: res.body.createdAt,
      });
    });
  });

  describe('/lots/:id/order/update PATCH', () => {
    it('should update Order data for lot', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...changedOrderBody, id: orderId })
        .expect(200);

      expect(res.body).toEqual({
        ...changedOrderBody,
        status: OrderStatus.pending,
        bidId: winnerBid.id,
        id: orderId,
        createdAt: res.body.createdAt,
      });
    });

    it('should not update Order of incorrect status', async () => {
      await orderRepo.save({ id: orderId, status: OrderStatus.sent });

      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...changedOrderBody, id: orderId })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            `Posssible to update/delete order only in "${OrderStatus.pending}" status`,
          ],
          error: 'Validation Error',
        });
    });

    it('should not update Order without id', async () => {
      await orderRepo.save({ id: orderId, status: OrderStatus.pending });

      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['id must be an integer number', 'id should not be empty'],
          error: 'Bad Request',
        });
    });

    it('should not update Order data for lot with incorrect data', async () => {
      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/update`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ arrivalType: 'wrong type', id: orderId })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['arrivalType must be a valid enum value'],
          error: 'Bad Request',
        });
    });

    it('should not update Order if user not owner of order', async () => {
      const notWinnerAccessToken = app
        .get<JwtService>(JwtService)
        .sign({ email: lot.owner.email, id: lot.owner.id });

      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/update`)
        .set('Authorization', 'Bearer ' + notWinnerAccessToken)
        .send({ ...changedOrderBody, id: orderId })
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'Forbidden resourse!',
          error: 'Forbidden',
        });
    });
  });

  describe('/lots/:id/order/change-status PATCH', () => {
    it('should not change order status from pending to sent by owner of Order', async () => {
      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/change-status`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ id: orderId, status: OrderStatus.sent })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            `You can not switch status from "${OrderStatus.pending}" to "${OrderStatus.sent}"`,
          ],
          error: 'Validation Error',
        });
    });

    it('should not change order status from pending to delivered by owner of Lot', async () => {
      lotOwnerAccessToken = app
        .get<JwtService>(JwtService)
        .sign({ email: lot.owner.email, id: lot.owner.id });

      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/change-status`)
        .set('Authorization', 'Bearer ' + lotOwnerAccessToken)
        .send({ id: orderId, status: OrderStatus.delivered })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            `You can not switch status from "${OrderStatus.pending}" to "${OrderStatus.delivered}"`,
          ],
          error: 'Validation Error',
        });
    });

    it('should change order status from pending to sent by owner of Lot', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/change-status`)
        .set('Authorization', 'Bearer ' + lotOwnerAccessToken)
        .send({ id: orderId, status: OrderStatus.sent })
        .expect(200);

      expect(res.body.status).toEqual(OrderStatus.sent);
    });

    it('should not change order status from sent to delivered by owner of Lot', async () => {
      return request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/change-status`)
        .set('Authorization', 'Bearer ' + lotOwnerAccessToken)
        .send({ id: orderId, status: OrderStatus.delivered })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            `You can not switch status from "${OrderStatus.sent}" to "${OrderStatus.delivered}"`,
          ],
          error: 'Validation Error',
        });
    });

    it('should change order status from sent to delivered by owner of Order', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/lots/${lot.id}/order/change-status`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ id: orderId, status: OrderStatus.delivered })
        .expect(200);

      expect(res.body.status).toEqual(OrderStatus.delivered);
    });
  });

  describe('/lots/:id/order/delete DELETE', () => {
    it('should not delete Order of incorrect status', async () => {
      await orderRepo.save({ id: orderId, status: OrderStatus.sent });

      return request(app.getHttpServer())
        .delete(`/lots/${lot.id}/order/delete`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ id: orderId })
        .expect(422)
        .expect({
          statusCode: 422,
          message: [
            `Posssible to update/delete order only in "${OrderStatus.pending}" status`,
          ],
          error: 'Validation Error',
        });
    });

    it('should not delete order by not owner of Order', async () => {
      await orderRepo.save({ id: orderId, status: OrderStatus.pending });

      lotOwnerAccessToken = app
        .get<JwtService>(JwtService)
        .sign({ email: lot.owner.email, id: lot.owner.id });

      return request(app.getHttpServer())
        .delete(`/lots/${lot.id}/order/delete`)
        .set('Authorization', 'Bearer ' + lotOwnerAccessToken)
        .send({ id: orderId })
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'Forbidden resourse!',
          error: 'Forbidden',
        });
    });

    it('should delete Order data for lot', async () => {
      await orderRepo.save({ id: orderId, status: OrderStatus.pending });

      return request(app.getHttpServer())
        .delete(`/lots/${lot.id}/order/delete`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ id: orderId })
        .expect(200)
        .expect({ raw: [], affected: 1 });
    });
  });
});

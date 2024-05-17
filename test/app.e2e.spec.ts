import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import request from 'supertest';

describe('App', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('(GET ALL) /driver/trip', () => {
    it('should return success', () => {
      return request(app.getHttpServer()).get('/driver/trip').query({ user_id: 1 }).expect(200);
    });

    it('should return unauthorized exception when user_id is not on query params', () => {
      return request(app.getHttpServer()).get('/driver/trip').expect(401);
    });
  });

  describe('(POST) /passenger/trip', () => {
    it('should create a trip', () => {
      return request(app.getHttpServer())
        .post('/passenger/trip')
        .query({ user_id: 1 })
        .send({
          driverId: 1,
          categoryId: 1,
          fare: 10.5,
          waypoints: {
            latFrom: 1,
            lonFrom: 1,
            latTo: -10,
            lonTo: -10
          }
        })
        .expect(201);
    });
  });

  describe('(POST) /driver/trip/:trip_id/confirm', () => {
    it('should confirm a trip', async () => {
      await request(app.getHttpServer())
        .post('/passenger/trip')
        .query({ user_id: 1 })
        .send({
          driverId: 1,
          categoryId: 1,
          fare: 10.5,
          waypoints: {
            latFrom: 1,
            lonFrom: 1,
            latTo: -10,
            lonTo: -10
          }
        })
        .expect(201);

      await request(app.getHttpServer()).post('/driver/trip/1/confirm').query({ user_id: 1 }).expect(201);
    });
  });

  describe('(POST) /driver/trip/:trip_id/finish', () => {
    it('should finish a trip', async () => {
      await request(app.getHttpServer())
        .post('/passenger/trip')
        .query({ user_id: 1 })
        .send({
          driverId: 1,
          categoryId: 1,
          fare: 10.5,
          waypoints: {
            latFrom: 1,
            lonFrom: 1,
            latTo: -10,
            lonTo: -10
          }
        })
        .expect(201);

      await request(app.getHttpServer()).post('/driver/trip/1/confirm').query({ user_id: 1 }).expect(201);
      await request(app.getHttpServer()).post('/driver/trip/1/finish').query({ user_id: 1 }).expect(201);
    });
  });

  describe('(POST) /driver/trip/:trip_id/finish', () => {
    it('should cancel a trip', async () => {
      await request(app.getHttpServer())
        .post('/passenger/trip')
        .query({ user_id: 1 })
        .send({
          driverId: 1,
          categoryId: 1,
          fare: 10.5,
          waypoints: {
            latFrom: 1,
            lonFrom: 1,
            latTo: -10,
            lonTo: -10
          }
        })
        .expect(201);

      await request(app.getHttpServer()).post('/driver/trip/1/confirm').query({ user_id: 1 }).expect(201);
      await request(app.getHttpServer()).delete('/driver/trip/1').query({ user_id: 1 }).expect(200);
    });
  });
});

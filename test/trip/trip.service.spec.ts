import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from 'trip/trip.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseTestingModule } from '../database/database.testing.module';
import { TripGatewayTypeorm } from 'trip/gateways/trip.gateway.typeorm';
import { User } from 'user/user.entity';
import { CreateTripDto } from 'trip/dto/create-trip.dto';

describe('TripService', () => {
  let service: TripService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...DatabaseTestingModule()],
      providers: [TripService, { provide: 'TripGatewayInterface', useClass: TripGatewayTypeorm }]
    }).compile();

    service = module.get<TripService>(TripService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a trip', async () => {
      const user = { id: 1 } as User;
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const createdTrip = await service.create(user, createTripDto);

      expect(createdTrip.id).toEqual(1);
      expect(createdTrip.driverId).toEqual(1);
      expect(createdTrip.passengerId).toEqual(1);
      expect(createdTrip.waypoints.id).toEqual(1);
      expect(createdTrip.waypoints.latFrom).toEqual(1);
      expect(createdTrip.waypoints.lonFrom).toEqual(1);
      expect(createdTrip.waypoints.latTo).toEqual(-10);
      expect(createdTrip.waypoints.lonTo).toEqual(-10);
    });

    it('should create two trips when driver is not the same', async () => {
      const user = { id: 1 } as User;
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const firstTrip = await service.create(user, createTripDto);
      const secondTrip = await service.create(user, { ...createTripDto, driverId: 2 });

      expect(firstTrip.id).toEqual(1);
      expect(firstTrip.driverId).toEqual(1);
      expect(firstTrip.passengerId).toEqual(1);

      expect(secondTrip.id).toEqual(2);
      expect(secondTrip.driverId).toEqual(2);
      expect(secondTrip.passengerId).toEqual(1);
    });

    it('should return forbidden exception when create a trip for the same driver twice', async () => {
      const user = { id: 1 } as User;
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      await service.create(user, createTripDto);

      expect(async () => await service.create(user, createTripDto)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.create(user, createTripDto)).rejects.toThrow('Passenger already book a trip with this driver');
    });

    it('should return forbidden exception when create a trip for a driver already in a trip', async () => {
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const firstTrip = await service.create({ id: 100 } as User, createTripDto);
      await service.confirm({ id: 1 } as User, firstTrip.id);

      expect(async () => await service.create({ id: 1 } as User, createTripDto)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.create({ id: 1 } as User, createTripDto)).rejects.toThrow('Driver is already on a trip');
    });

    it('should return forbidden exception when create a trip for a passenger already in a trip', async () => {
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const firstTrip = await service.create({ id: 1 } as User, createTripDto);
      await service.confirm({ id: 1 } as User, firstTrip.id);

      const createTripDtoForDriver2 = { ...createTripDto, driverId: 2 };

      expect(async () => await service.create({ id: 1 } as User, createTripDtoForDriver2)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.create({ id: 1 } as User, createTripDtoForDriver2)).rejects.toThrow('Passenger is already on a trip');
    });
  });

  describe('findAll', () => {
    it('should return all created trips', async () => {
      const user = { id: 1 } as User;
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      await service.create(user, createTripDto);
      await service.create(user, { ...createTripDto, driverId: 2 });

      const trips = await service.findAll(user);
      expect(trips.length).toEqual(2);
    });
  });

  describe('confirm', () => {
    it('should confirm a trip', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);

      const confirmedTrip = await service.findOne({ id: driverId }, trip.id);
      expect(confirmedTrip.acceptedAt).not.toBeNull();
    });

    it('should return not found exception when confirming a trip that not belongs to driver', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId: 10,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);

      expect(async () => await service.confirm({ id: driverId } as User, trip.id)).rejects.toThrow(NotFoundException);
      expect(async () => await service.confirm({ id: driverId } as User, trip.id)).rejects.toThrow('Trip was not found');
    });

    it('should return forbidden exception when driver is already on a trip', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      const newTrip = await service.create({ id: 100 } as User, createTripDto);

      await service.confirm({ id: driverId } as User, trip.id);

      expect(async () => await service.confirm({ id: driverId } as User, newTrip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.confirm({ id: driverId } as User, newTrip.id)).rejects.toThrow('Driver is already on a trip');
    });

    it('should return forbidden exception when passenger is already on a trip', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      const newTrip = await service.create({ id: passengerId } as User, { ...createTripDto, driverId: 100 });
      await service.confirm({ id: driverId } as User, trip.id);

      expect(async () => await service.confirm({ id: 100 } as User, newTrip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.confirm({ id: 100 } as User, newTrip.id)).rejects.toThrow('Passenger is already on a trip');
    });

    it('should soft delete all trips from driver or passenger when driver confirm a trip', async () => {
      const createTripDto = {
        driverId: 1,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const tripForDriver1AndPassanger1 = await service.create({ id: 1 } as User, createTripDto);
      const tripForDriver1AndPassenger2 = await service.create({ id: 2 } as User, createTripDto);
      const tripForDriver2AndPassenger1 = await service.create({ id: 1 } as User, { ...createTripDto, driverId: 2 });
      const tripForDriver2AndPassenger2 = await service.create({ id: 2 } as User, { ...createTripDto, driverId: 2 });

      await service.confirm({ id: 1 } as User, tripForDriver1AndPassanger1.id);

      const trips = await service.findAll({ id: 1 });

      const updatedTripForDriver1AndPassenger1 = trips.find(trip => trip.id == tripForDriver1AndPassanger1.id);
      expect(updatedTripForDriver1AndPassenger1.acceptedAt).not.toBeNull();
      expect(updatedTripForDriver1AndPassenger1.deletedAt).toBeNull();

      const updatedTripForDriver1AndPassenger2 = trips.find(trip => trip.id == tripForDriver1AndPassenger2.id);
      expect(updatedTripForDriver1AndPassenger2.acceptedAt).toBeNull();
      expect(updatedTripForDriver1AndPassenger2.deletedAt).not.toBeNull();

      const updatedTripForDriver2AndPassenger1 = trips.find(trip => trip.id == tripForDriver2AndPassenger1.id);
      expect(updatedTripForDriver2AndPassenger1.acceptedAt).toBeNull();
      expect(updatedTripForDriver2AndPassenger1.deletedAt).not.toBeNull();

      const updatedTripForDriver2AndPassenger2 = trips.find(trip => trip.id == tripForDriver2AndPassenger2.id);
      expect(updatedTripForDriver2AndPassenger2.acceptedAt).toBeNull();
      expect(updatedTripForDriver2AndPassenger2.deletedAt).toBeNull();
    });
  });

  describe('finish', () => {
    it('should finish a trip', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);
      await service.finish({ id: driverId } as User, trip.id);

      const finishedTrip = await service.findOne({ id: driverId }, trip.id);
      expect(finishedTrip.acceptedAt).not.toBeNull();
      expect(finishedTrip.finishedAt).not.toBeNull();
    });

    it('should return not found exception when finishing a trip that not belongs to driver', async () => {
      const passengerId = 1;
      const createTripDto = {
        driverId: 10,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);

      expect(async () => await service.finish({ id: 100 } as User, trip.id)).rejects.toThrow(NotFoundException);
      expect(async () => await service.finish({ id: 100 } as User, trip.id)).rejects.toThrow('Trip was not found');
    });

    it('should return forbidden exception when trip is not confirmed', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);

      expect(async () => await service.finish({ id: driverId } as User, trip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.finish({ id: driverId } as User, trip.id)).rejects.toThrow('Trip is not accepted or is already finished or canceled');
    });

    it('should return forbidden exception when trip is already finished', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);
      await service.finish({ id: driverId } as User, trip.id);

      expect(async () => await service.finish({ id: driverId } as User, trip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.finish({ id: driverId } as User, trip.id)).rejects.toThrow('Trip is not accepted or is already finished or canceled');
    });

    it('should return forbidden exception when trip is already canceled', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);
      await service.cancel({ id: driverId } as User, trip.id);

      expect(async () => await service.finish({ id: driverId } as User, trip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.finish({ id: driverId } as User, trip.id)).rejects.toThrow('Trip is not accepted or is already finished or canceled');
    });
  });

  describe('cancel', () => {
    it('should cancel a trip', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);
      await service.cancel({ id: driverId } as User, trip.id);

      const canceledTrip = await service.findOne({ id: driverId }, trip.id);
      expect(canceledTrip.acceptedAt).not.toBeNull();
      expect(canceledTrip.canceledAt).not.toBeNull();
    });

    it('should return not found exception when canceling a trip that not belongs to driver', async () => {
      const passengerId = 1;
      const createTripDto = {
        driverId: 10,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);

      expect(async () => await service.cancel({ id: 100 } as User, trip.id)).rejects.toThrow(NotFoundException);
      expect(async () => await service.cancel({ id: 100 } as User, trip.id)).rejects.toThrow('Trip was not found');
    });

    it('should return forbidden exception when trip is not confirmed', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);

      expect(async () => await service.cancel({ id: driverId } as User, trip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.cancel({ id: driverId } as User, trip.id)).rejects.toThrow('Trip is not accepted or is already finished or canceled');
    });

    it('should return forbidden exception when trip is already finished', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);
      await service.finish({ id: driverId } as User, trip.id);

      expect(async () => await service.cancel({ id: driverId } as User, trip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.cancel({ id: driverId } as User, trip.id)).rejects.toThrow('Trip is not accepted or is already finished or canceled');
    });

    it('should return forbidden exception when trip is already canceled', async () => {
      const driverId = 1;
      const passengerId = 1;
      const createTripDto = {
        driverId,
        categoryId: 1,
        fare: 10.5,
        waypoints: {
          latFrom: 1,
          lonFrom: 1,
          latTo: -10,
          lonTo: -10
        }
      } as CreateTripDto;

      const trip = await service.create({ id: passengerId } as User, createTripDto);
      await service.confirm({ id: driverId } as User, trip.id);
      await service.cancel({ id: driverId } as User, trip.id);

      expect(async () => await service.cancel({ id: driverId } as User, trip.id)).rejects.toThrow(ForbiddenException);
      expect(async () => await service.cancel({ id: driverId } as User, trip.id)).rejects.toThrow('Trip is not accepted or is already finished or canceled');
    });
  });
});

import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';
import { TripGatewayInterface } from './gateways/trip.gateway.interface';
import { User } from '../user/user.entity';
import { Waypoints } from 'waypoint/entities/waypoints.entity';

@Injectable()
export class TripService {
  private readonly serviceContext = 'TripService';

  constructor(@Inject('TripGatewayInterface') private readonly tripGateway: TripGatewayInterface) {}

  async findAll(user: User): Promise<Trip[]> {
    Logger.log({ event: `${this.serviceContext}.findAll`, message: 'Finding all trips', user_id: user.id }, this.serviceContext);
    return await this.tripGateway.findAll();
  }

  async findOne(user: User, id: number): Promise<Trip> {
    Logger.log({ event: `${this.serviceContext}.findOne`, message: `Finding trip by id`, trip_id: id, user_id: user.id }, this.serviceContext);
    const trip = await this.tripGateway.findById(id, user.id);
    if (!trip) throw new NotFoundException('Trip was not found');
    return trip;
  }

  async create(user: User, createTripDto: CreateTripDto): Promise<Trip> {
    Logger.log({ event: `${this.serviceContext}.create`, message: 'Creating trip', payload: `${JSON.stringify(createTripDto)}`, user_id: user.id }, this.serviceContext);
    await this.isAbleToCreate(user, createTripDto);
    const trip = new Trip({ ...createTripDto, passengerId: user.id, waypoints: new Waypoints(createTripDto.waypoints) });
    return await this.tripGateway.create(trip);
  }

  async isAbleToCreate(user: User, createTripDto: CreateTripDto) {
    await this.verifyIfPassengerAlreadyBookThisTrip(user.id, createTripDto.driverId);
    await this.verifyIfDriverIsOnATrip(createTripDto.driverId);
    await this.verifyIfPassengerIsOnATrip(user.id);
  }

  async finish(user: User, id: number): Promise<void> {
    Logger.log({ event: `${this.serviceContext}.finish`, message: `Finishing trip`, trip_id: id, user_id: user.id }, this.serviceContext);
    await this.isAbleToFinish(user, id);
    await this.tripGateway.update(id, { finishedAt: new Date() });
  }

  async isAbleToFinish(user: User, id: number) {
    const trip = await this.findOne(user, id);
    await this.verifyIfIsAbleToFinishOrCancel(trip);
  }

  async confirm(user: User, id: number): Promise<void> {
    Logger.log({ event: `${this.serviceContext}.confirm`, message: `Confirming trip ${id}`, trip_id: id, user_id: user.id }, this.serviceContext);
    const trip = await this.isAbleToConfirm(user, id);
    await this.softDeleteAllPendingTripsExceptCurrentAcceptedOne({ id, driverId: user.id, passengerId: trip.passengerId });
    await this.tripGateway.update(id, { acceptedAt: new Date() });
  }

  async isAbleToConfirm(user: User, id: number): Promise<Trip> {
    const trip = await this.findOne(user, id);
    await this.verifyIfDriverIsOnATrip(user.id);
    await this.verifyIfPassengerIsOnATrip(trip.passengerId);
    return trip;
  }

  async cancel(user: User, id: number): Promise<void> {
    Logger.log({ event: `${this.serviceContext}.cancel`, message: `Canceling trip ${id}`, trip_id: id, user_id: user.id }, this.serviceContext);
    await this.isAbleToCancel(user, id);
    await this.tripGateway.update(id, { canceledAt: new Date() });
  }

  private async isAbleToCancel(user: User, id: number): Promise<void> {
    const trip = await this.findOne(user, id);
    await this.verifyIfIsAbleToFinishOrCancel(trip);
  }

  async softDeleteAllPendingTripsExceptCurrentAcceptedOne({ id, driverId, passengerId }): Promise<void> {
    await this.tripGateway.softDeletePendingTripsExceptCurrentOne(id, driverId, passengerId);
  }

  async verifyIfDriverIsOnATrip(driverId: number): Promise<void> {
    const isOnATrip = await this.tripGateway.findInProgressTripByDriverId(driverId);
    if (isOnATrip) throw new ForbiddenException('Driver is already on a trip');
  }

  async verifyIfPassengerIsOnATrip(passengerId: number): Promise<void> {
    const isOnATrip = await this.tripGateway.findInProgressTripByPassengerId(passengerId);
    if (isOnATrip) throw new ForbiddenException('Passenger is already on a trip');
  }

  async verifyIfIsAbleToFinishOrCancel(trip: Trip): Promise<void> {
    if (!trip.acceptedAt || trip.finishedAt || trip.canceledAt || trip.deletedAt) throw new ForbiddenException('Trip is not accepted or is already finished or canceled');
  }

  async verifyIfPassengerAlreadyBookThisTrip(passengerId: number, driverId: number) {
    const trip = await this.tripGateway.findBookedTrips(passengerId, driverId);
    if (trip) throw new ForbiddenException('Passenger already book a trip with this driver');
  }
}

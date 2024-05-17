import { Trip } from '../entities/trip.entity';

export interface TripGatewayInterface {
  create(trip: Trip): Promise<Trip>;
  findAll(): Promise<Trip[]>;
  findById(id: number, driverId: number): Promise<Trip>;
  findBookedTrips(passengerId: number, driverId: number): Promise<Trip>;
  findInProgressTripByDriverId(id: number): Promise<Trip>;
  findInProgressTripByPassengerId(id: number): Promise<Trip>;
  update(id: number, trip: Partial<Trip>): Promise<number>;
  softDeletePendingTripsExceptCurrentOne(id: number, driverId: number, passengerId: number): Promise<boolean>;
}

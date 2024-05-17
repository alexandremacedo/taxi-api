import { Trip } from '../entities/trip.entity';
import { Repository } from 'typeorm';
import { Trip as TripModel } from '../entities/trip.model';
import { TripGatewayInterface } from './trip.gateway.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TripGatewayTypeorm implements TripGatewayInterface {
  constructor(
    @InjectRepository(TripModel)
    private tripRepository: Repository<TripModel>
  ) {}
  async create(trip: Trip): Promise<Trip> {
    return await this.tripRepository.save(trip);
  }

  async findAll(): Promise<Trip[]> {
    return await this.tripRepository.find({
      relations: ['waypoints']
    });
  }

  async findById(id: number, driverId: number): Promise<Trip> {
    return await this.tripRepository.findOneBy({ id, driverId });
  }

  async findBookedTrips(passengerId: number, driverId: number): Promise<Trip> {
    return await this.tripRepository
      .createQueryBuilder()
      .select()
      .andWhere('passenger_id = :passengerId', { passengerId })
      .andWhere('driver_id = :driverId', { driverId })
      .andWhere('(accepted_at IS NULL OR accepted_at IS NOT NULL)')
      .andWhere('finished_at IS NULL')
      .andWhere('canceled_at IS NULL')
      .andWhere('deleted_at IS NULL')
      .getOne();
  }

  async findInProgressTripByDriverId(driverId: number): Promise<Trip> {
    return await this.tripRepository
      .createQueryBuilder()
      .select()
      .andWhere('driver_id = :driverId', { driverId })
      .andWhere('accepted_at IS NOT NULL')
      .andWhere('finished_at IS NULL')
      .andWhere('canceled_at IS NULL')
      .andWhere('deleted_at IS NULL')
      .getOne();
  }

  async findInProgressTripByPassengerId(passengerId: number): Promise<Trip> {
    return await this.tripRepository
      .createQueryBuilder()
      .select()
      .andWhere('passenger_id = :passengerId', { passengerId })
      .andWhere('accepted_at IS NOT NULL')
      .andWhere('finished_at IS NULL')
      .andWhere('canceled_at IS NULL')
      .andWhere('deleted_at IS NULL')
      .getOne();
  }

  async update(id: number, tripPartial: Partial<Trip>): Promise<number> {
    const updatedTrip = await this.tripRepository.save({ id, ...tripPartial });
    return updatedTrip?.id;
  }

  async softDeletePendingTripsExceptCurrentOne(id: number, driverId: number, passengerId: number): Promise<boolean> {
    const updated = await this.tripRepository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: new Date() })
      .where('id != :id', { id })
      .andWhere('(driver_id = :driverId OR passenger_id = :passengerId)', { driverId, passengerId })
      .andWhere('accepted_at IS NULL')
      .andWhere('finished_at IS NULL')
      .andWhere('canceled_at IS NULL')
      .andWhere('deleted_at IS NULL')
      .execute();
    return Boolean(updated);
  }
}

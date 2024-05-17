import { Module } from '@nestjs/common';
import { PassengerTripController, TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripGatewayTypeorm } from './gateways/trip.gateway.typeorm';
import { Trip } from './entities/trip.model';
import { TripService } from './trip.service';
import { Waypoints } from 'waypoint/entities/waypoints.model';

@Module({
  imports: [TypeOrmModule.forFeature([Waypoints, Trip])],
  controllers: [TripController, PassengerTripController],
  providers: [TripService, { provide: 'TripGatewayInterface', useClass: TripGatewayTypeorm }]
})
export class TripModule {}

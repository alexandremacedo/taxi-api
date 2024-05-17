import { Module } from '@nestjs/common';
import { TripModule } from './trip/trip.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './trip/entities/trip.model';
import { Waypoints } from 'waypoint/entities/waypoints.model';

@Module({
  imports: [
    TripModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Waypoints, Trip],
      synchronize: true
    })
  ]
})
export class AppModule {}

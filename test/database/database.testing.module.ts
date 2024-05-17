import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'trip/entities/trip.model';
import { Waypoints } from 'waypoint/entities/waypoints.model';

export const DatabaseTestingModule = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Waypoints, Trip],
    synchronize: true
  }),
  TypeOrmModule.forFeature([Waypoints, Trip])
];

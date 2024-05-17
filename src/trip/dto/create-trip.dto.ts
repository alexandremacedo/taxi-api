import { Waypoints } from 'waypoint/entities/waypoints.entity';

export class CreateTripDto {
  passengerId: number;
  driverId: number;
  categoryId: number;
  fare: number;
  waypoints?: Waypoints;
}

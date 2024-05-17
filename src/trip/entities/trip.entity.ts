import { Waypoints } from 'waypoint/entities/waypoints.entity';

export class Trip {
  public id?: number;
  public fare: number;
  public waypointsId: number;
  public driverId: number;
  public passengerId: number;
  public categoryId: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  public acceptedAt?: Date;
  public finishedAt?: Date;
  public canceledAt?: Date;
  public deletedAt?: Date;
  public waypoints: Waypoints;

  constructor({ fare, waypoints, driverId, passengerId, categoryId }) {
    this.fare = fare;
    this.waypoints = waypoints;
    this.driverId = driverId;
    this.passengerId = passengerId;
    this.categoryId = categoryId;
  }
}

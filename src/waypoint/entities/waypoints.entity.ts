export class Waypoints {
  public id?: number;
  public latFrom: number;
  public lonFrom: number;
  public latTo: number;
  public lonTo: number;
  public createdAt?: Date;

  constructor({ latFrom, lonFrom, latTo, lonTo }) {
    this.latFrom = latFrom;
    this.lonFrom = lonFrom;
    this.latTo = latTo;
    this.lonTo = lonTo;
  }
}

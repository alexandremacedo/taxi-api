import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Waypoints } from 'waypoint/entities/waypoints.model';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fare' })
  fare: number;

  @Column({ name: 'waypoints_id' })
  waypointsId: number;

  @Column({ name: 'driver_id' })
  driverId: number;

  @Column({ name: 'passenger_id' })
  passengerId: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @Column({ name: 'accepted_at', type: 'datetime', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'finished_at', type: 'datetime', nullable: true })
  finishedAt: Date;

  @Column({ name: 'canceled_at', type: 'datetime', nullable: true })
  canceledAt: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;

  @OneToOne(() => Waypoints, { cascade: ['insert'] })
  @JoinColumn({
    name: 'waypoints_id'
  })
  waypoints: Waypoints;
}

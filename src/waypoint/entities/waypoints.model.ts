import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('waypoints')
export class Waypoints {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lat_from' })
  latFrom: number;

  @Column({ name: 'lon_from' })
  lonFrom: number;

  @Column({ name: 'lat_to' })
  latTo: number;

  @Column({ name: 'lon_to' })
  lonTo: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
} from 'typeorm';

@Entity({ name: 'car_trips' })
@Index(['carName'])
@Index(['driverName'])
@Index(['companyName'])
@Index(['startedAt'])
export class CarTripsEntity {
    @PrimaryGeneratedColumn({ name: 'trip_id', type: 'int' })
    tripId: number;

    @Column({ name: 'car_name', type: 'varchar', length: 255 })
    carName: string;

    @Column({ name: 'driver_name', type: 'varchar', length: 255 })
    driverName: string;

    @Column({ name: 'company_name', type: 'varchar', length: 255 })
    companyName: string;

    @Column({ name: 'start_location', type: 'varchar', length: 255 })
    startLocation: string;

    @Column({ name: 'end_location', type: 'varchar', length: 255 })
    endLocation: string;

    @Column({ name: 'distance_km', type: 'numeric', precision: 10, scale: 2 })
    distanceKm: number;

    @Column({ name: 'fuel_liters', type: 'numeric', precision: 10, scale: 2 })
    fuelLiters: number;

    @Column({ name: 'duration_minutes', type: 'int' })
    durationMinutes: number;

    @Column({ name: 'avg_speed_kmh', type: 'numeric', precision: 10, scale: 2 })
    avgSpeedKmh: number;

    @Column({ name: 'trip_cost', type: 'numeric', precision: 10, scale: 2 })
    tripCost: number;

    @Column({ name: 'started_at', type: 'timestamp' })
    startedAt: Date;

    @Column({ name: 'start_lat', type: 'numeric', precision: 10, scale: 6 })
    startLat: number;

    @Column({ name: 'start_lng', type: 'numeric', precision: 10, scale: 6 })
    startLng: number;

    @Column({ name: 'end_lat', type: 'numeric', precision: 10, scale: 6 })
    endLat: number;

    @Column({ name: 'end_lng', type: 'numeric', precision: 10, scale: 6 })
    endLng: number;

    // Added later via migration
    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId: number;
}
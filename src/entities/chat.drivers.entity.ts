import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

export enum YesNoEnum {
  Y = 'Y',
  N = 'N',
}

@Entity({ name: 'drivers' })
export class ChatDriverEntity {
  @PrimaryGeneratedColumn({ unsigned: true, name: 'DriverID' })
  driverId: number;

  @Column({ name: 'DriverName', type: 'varchar', length: 150, nullable: true })
  driverName: string;

  @Column({ name: 'DriverDesc', type: 'varchar', length: 250, nullable: true })
  driverDesc: string | null;

  @Column({ name: 'DriverImage', type: 'varchar', length: 255, nullable: true })
  driverImage: string | null;

  @Index()
  @Column({ name: 'Button', type: 'bigint', unsigned: true, default: () => '0' })
  button: string;

  @Index()
  @Column({ name: 'AUXCode', type: 'varchar', length: 50, nullable: true })
  auxCode: string | null;

  @Column({ name: 'DriverGroupID', type: 'int', unsigned: true, default: 0 })
  driverGroupId: number;

  @Column({ name: 'DriverCompanyID', type: 'int', unsigned: true, default: 0 })
  driverCompanyId: number;

  @Column({ name: 'SMSNumber', type: 'varchar', length: 25, default: '' })
  smsNumber: string;

  @Column({ name: 'DriverEmail', type: 'varchar', length: 150, default: '' })
  driverEmail: string;

  @Column({
    name: 'DriverChanged',
    type: 'enum',
    enum: YesNoEnum,
    default: YesNoEnum.Y,
  })
  driverChanged: YesNoEnum;

  @Column({ name: 'DriverPIN', type: 'varchar', length: 25, default: '' })
  driverPin: string;

  @Column({
    name: 'DriverActive',
    type: 'enum',
    enum: YesNoEnum,
    default: YesNoEnum.Y,
  })
  driverActive: YesNoEnum;

  @Index()
  @Column({ name: 'WorkPlaceID', type: 'int', unsigned: true, default: 0 })
  workPlaceId: number;

  @Column({ name: 'WorkFrom', type: 'timestamp', nullable: true })
  workFrom: string | null;

  @Column({ name: 'WorkTill', type: 'timestamp', nullable: true })
  workTill: string | null;

  @Column({
    name: 'WorkContractType',
    type: 'boolean',
    unsigned: true,
    default: 0,
  })
  workContractType: number;

  @Column({
    name: 'WorkPayCategory',
    type: 'smallint',
    unsigned: true,
    default: 0,
  })
  workPayCategory: number;

  @Column({ name: 'LicenseNumber', type: 'varchar', length: 25, default: '' })
  licenseNumber: string;

  @Column({ name: 'LicenseValidTill', type: 'timestamp', nullable: true })
  licenseValidTill: Date | null;

  @Column({ name: 'LicenseCat', type: 'int', unsigned: true, default: 0 })
  licenseCat: number;

  @Column({ name: 'DriverBirthYear', type: 'smallint', default: 0 })
  driverBirthYear: number;

  @Column({
    name: 'DriverBirthDate',
    type: 'timestamp',
    default: '1975-01-01',
  })
  driverBirthDate: string;

  @Column({ name: 'DriverBirthTown', type: 'varchar', length: 75, nullable: true })
  driverBirthTown: string | null;

  @Column({ name: 'DriverAddress', type: 'varchar', length: 150, nullable: true })
  driverAddress: string | null;

  @Column({ name: 'DriverTown', type: 'varchar', length: 75, nullable: true })
  driverTown: string | null;

  @Index()
  @Column({ name: 'DriverCard', type: 'varchar', length: 50, nullable: true })
  driverCard: string | null;

  @Column({ name: 'DriverOIB', type: 'varchar', length: 25, nullable: true })
  driverOib: string | null;

  @Index()
  @Column({ name: 'DriverFMSCard', type: 'varchar', length: 25, default: '' })
  driverFmsCard: string;

  @Column({ name: 'DriverFMSCardValidTill', type: 'timestamp', nullable: true })
  driverFmsCardValidTill: string | null;

  @Column({ name: 'DriverCategoryID', type: 'int', unsigned: true, default: 0 })
  driverCategoryId: number;

  @Column({
    name: 'DriverExpense',
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
  })
  driverExpense: string;

  @Column({ name: 'pin', type: 'varchar', length: 255 })
  pin: string;
}

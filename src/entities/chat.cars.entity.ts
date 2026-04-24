import { CarDSTEnum, CarProtocolSCPEnum, CarsYesNoEnum } from '../dto/cars/cars.dto';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';


@Entity({ name: 'chat_cars' })
@Index('CarGroupID', ['carGroupId'])
@Index('CarTypeID', ['carTypeId'])
@Index('CarModelID', ['carModelId'])
@Index('LDCID', ['ldcId'])
@Index('CompanyID', ['companyId'])
@Index('DefaultDriverID', ['defaultDriverId'])
@Index('DefaultDockID', ['defaultDockId'])
@Index('CarEnabled', ['carEnabled'])
export class ChatCarEntity {
  @PrimaryGeneratedColumn({
    name: 'ChatCarID',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'CarID', type: 'int', unsigned: true, default: 0 })
  carId: number;

  @Column({ name: 'CarGroupID', type: 'int', unsigned: true, default: 0 })
  carGroupId: number;

  @Column({ name: 'CarTypeID', type: 'int', unsigned: true, default: 0 })
  carTypeId: number;

  @Column({ name: 'CarName', type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'CarIconID', type: 'boolean', unsigned: true, default: 0 })
  iconId: number;

  @Column({ name: 'CarColor', type: 'int', unsigned: true, default: 0 })
  color: number;

  @Column({
    name: 'CarDescription',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @Column({ name: 'CarStatus', type: 'boolean', unsigned: true, default: 0 })
  status: number;

  @Column({ name: 'CarLastTime', type: 'timestamp', nullable: true })
  lastTime: Date | null;

  @Column({ name: 'CarDataPhone', type: 'varchar', length: 25, nullable: true })
  dataPhone: string | null;

  @Column({
    name: 'CarVoicePhone',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  voicePhone: string | null;

  @Column({
    name: 'CarScheduled',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.N,
  })
  scheduled: CarsYesNoEnum;

  @Column({ name: 'CarSpend', type: 'float', default: 10 })
  spend: number;

  @Column({
    name: 'CarDeviceVersion',
    type: 'boolean',
    unsigned: true,
    default: 3,
  })
  deviceVersion: number;

  @Column({ name: 'CarDeviceName', type: 'varchar', length: 15, default: '' })
  deviceName: string;

  @Column({ name: 'CarDeviceHWVer', type: 'int', unsigned: true, default: 0 })
  deviceHwVersion: number;

  @Column({ name: 'CarDeviceFWVer', type: 'int', unsigned: true, default: 0 })
  deviceFwVersion: number;

  @Column({ name: 'CarDeviceNRFVer', type: 'int', unsigned: true, default: 0 })
  deviceNrfVersion: number;

  @Column({
    name: 'CarGPSStatus',
    type: 'smallint',
    unsigned: true,
    default: 0,
  })
  gpsStatus: number;

  @Column({ name: 'CarConfig', type: 'json', nullable: true })
  config: {} | null;

  @Column({ name: 'CarExtConfig', type: 'json', nullable: true })
  extConfig: {} | null;

  @Column({ name: 'CarEcoConfig', type: 'json', nullable: true })
  ecoConfig: {} | null;

  @Column({ name: 'CarTachoInfo', type: 'json', nullable: true })
  tachoInfo: {} | null;

  @Column({ name: 'CarIMEI', type: 'varchar', length: 25, nullable: true })
  imei: string | null;

  @Column({
    name: 'CarAUX',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.N,
  })
  aux: CarsYesNoEnum;

  @Column({ name: 'CarPIN', type: 'char', length: 4, default: '????' })
  pin: string;

  @Column({
    name: 'CarUsePIN',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.N,
  })
  usePin: CarsYesNoEnum;

  @Column({ name: 'CarLink', type: 'varchar', length: 255, nullable: true })
  link: string | null;

  @Column({ name: 'CarAlarm1', type: 'boolean', unsigned: true, default: 0 })
  alarm1: number;

  @Column({ name: 'CarAlarm2', type: 'boolean', unsigned: true, default: 0 })
  alarm2: number;

  @Column({ name: 'CarAlarm3', type: 'boolean', unsigned: true, default: 0 })
  alarm3: number;

  @Column({ name: 'CarAlarm4', type: 'boolean', unsigned: true, default: 0 })
  alarm4: number;

  @Column({ name: 'CarAlarm5', type: 'boolean', unsigned: true, default: 0 })
  alarm5: number;

  @Column({ name: 'Button', type: 'bigint', unsigned: true, default: 0 })
  button: string;

  @Column({
    name: 'CarChanged',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.Y,
  })
  changed: CarsYesNoEnum;

  @Column({
    name: 'CarActive',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.Y,
  })
  active: CarsYesNoEnum;

  @Column({
    name: 'CarEnabled',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.Y,
  })
  carEnabled: CarsYesNoEnum;

  @Column({ name: 'MNC', type: 'smallint', unsigned: true, default: 0 })
  mnc: number;

  @Column({ name: 'MCC', type: 'smallint', unsigned: true, default: 219 })
  mcc: number;

  @Column({
    name: 'IsMobilePhone',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.N,
  })
  isMobilePhone: CarsYesNoEnum;

  @Column({
    name: 'IsTrailer',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.N,
  })
  isTrailer: CarsYesNoEnum;

  @Column({ name: 'CarModelID', type: 'int', default: 0 })
  carModelId: number;

  @Column({ name: 'VIN', type: 'varchar', length: 25, nullable: true })
  vin: string | null;

  @Column({ name: 'HHTID', type: 'boolean', unsigned: true, default: 0 })
  hhtId: number;

  @Column({ name: 'HHTVersion', type: 'int', unsigned: true, default: 0 })
  hhtVersion: number;

  @Column({ name: 'LDCID', type: 'int', unsigned: true, default: 0 })
  ldcId: number;

  @Column({ name: 'AUXCode', type: 'varchar', length: 25, nullable: true })
  auxCode: string | null;

  @Column({ name: 'LinkedCarID', type: 'int', unsigned: true, default: 0 })
  linkedCarId: number;

  @Column({ name: 'CompanyID', type: 'int', unsigned: true, default: 0 })
  companyId: number;

  @Column({ name: 'DefaultDriverID', type: 'int', unsigned: true, default: 0 })
  defaultDriverId: number;

  @Column({ name: 'DefaultDockID', type: 'int', unsigned: true, default: 0 })
  defaultDockId: number;

  @Column({
    name: 'DefaultCarDivisionID',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  defaultCarDivisionId: number;

  @Column({
    name: 'DefaultReturnToLDC',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.Y,
  })
  defaultReturnToLdc: CarsYesNoEnum;

  @Column({
    name: 'DefaultFreeViaLDC',
    type: 'enum',
    enum: CarsYesNoEnum,
    default: CarsYesNoEnum.N,
  })
  defaultFreeViaLdc: CarsYesNoEnum;

  @Column({ name: 'CarTimeZone', type: 'smallint', default: 60 })
  timeZone: number;

  @Column({
    name: 'CarDST',
    type: 'enum',
    enum: CarDSTEnum,
    default: CarDSTEnum.E,
  })
  dst: CarDSTEnum;

  @Column({
    name: 'CarProtocolSCP',
    type: 'enum',
    enum: CarProtocolSCPEnum,
    default: CarProtocolSCPEnum.T0,
  })
  protocolScp: CarProtocolSCPEnum;
}

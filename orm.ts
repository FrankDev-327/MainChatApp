import 'dotenv/config';
import devConfigDBConnection from './dev.setting.config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  port: process.env.NODE_ENV !== 'prod' ? devConfigDBConnection.port : Number(process.env.DATABASE_PORT),
  database: process.env.NODE_ENV !== 'prod' ? devConfigDBConnection.database : process.env.DATABASE,
  username: process.env.NODE_ENV !== 'prod' ? devConfigDBConnection.username : process.env.DB_USER_NAME,
  password: process.env.NODE_ENV !== 'prod' ? devConfigDBConnection.password : process.env.DB_USER_PASSWORD,
  host: process.env.NODE_ENV !== 'prod' ? devConfigDBConnection.host : process.env.DATABASE_IP,
  logger: 'file',
  maxQueryExecutionTime: 1000, //will log slow queries
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  subscribers: [],
  logging: process.env.NODE_ENV !== 'prod',
} as const;

const dataSource = new DataSource(dbdatasource);
export default dataSource;

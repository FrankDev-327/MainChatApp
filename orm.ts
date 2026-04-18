import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_DB,
  port:  Number(process.env.DATABASE_PORT) || 3306,
  database: process.env.DATABASE,
  username: process.env.DB_USER_NAME,
  password: process.env.DB_USER_PASSWORD,
  host: process.env.DATABASE_IP,
  logger: 'file',
  maxQueryExecutionTime: 1000, //will log slow queries
  entities: ['dist/**/*.entity{.ts,.js}'],
  subscribers: [],
  logging: process.env.NODE_ENV !== 'prod',
} as const; 

const dataSource = new DataSource(dbdatasource);
export default dataSource;
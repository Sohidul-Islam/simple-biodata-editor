import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306/simple_biodata_editor';

// Prevent multiple pools in Next.js hot-reloading in development
const globalForDrizzle = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

const pool = globalForDrizzle.pool ?? mysql.createPool(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.pool = pool;
}

export const db = drizzle(pool, { schema, mode: 'default' });

import * as dotenv from 'dotenv';

dotenv.config();

export const serverport = Number(process.env.API_PORT);
export const DBHOST = String(process.env.DATABASE_HOST);
export const DBPORT = Number(process.env.DATABASE_PORT);
export const DBNAME = String(process.env.DATABASE_NAME);
export const DBUSER = String(process.env.DATABASE_USER);
export const DBPASSWORD = String(process.env.DATABASE_PASSWORD);
export const JWTSECRETE = String(process.env.JWT_SECRETE);

export const ENVIRONMENT = String(process.env.ENVIRONMENT);
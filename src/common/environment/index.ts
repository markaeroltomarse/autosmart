import * as dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = +process.env.APP_PORT || 3000;
export const APP_ENV = process.env.APP_ENV || '';
export const APP_VERSION = process.env.APP_VERSION || '0.0.1';

export const CORS_ALLOWED_HEADERS =
  process.env.CORS_ALLOWED_HEADERS ||
  'Access-Control-Allow-Headers,Origin,X-Requested-With,Content-Type,Accept,Authorization';
export const CORS_EXPOSED_HEADERS = process.env.CORS_EXPOSED_HEADERS || '';
export const CORS_WHITELIST = process.env.CORS_WHITELIST || '';

export const JWT_SECRET = process.env.JWT_SECRET || '';

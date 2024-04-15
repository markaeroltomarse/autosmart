import * as dotenv from 'dotenv';
dotenv.config();

export const BASE_URL = process.env.BASE_URL || '';
export const FE_URL = process.env.FE_URL || '';

export const APP_PORT = +process.env.APP_PORT || 3000;
export const APP_ENV = process.env.APP_ENV || '';
export const APP_VERSION = process.env.APP_VERSION || '0.0.1';

export const CORS_ALLOWED_HEADERS =
  process.env.CORS_ALLOWED_HEADERS ||
  'Access-Control-Allow-Headers,Origin,X-Requested-With,Content-Type,Accept,Authorization';
export const CORS_EXPOSED_HEADERS = process.env.CORS_EXPOSED_HEADERS || '';
export const CORS_WHITELIST = process.env.CORS_WHITELIST || '';

export const JWT_SECRET = process.env.JWT_SECRET || '';

export const EMAIL_NOTIFICATION_FROM = process.env.MAILER_USER || '';
export const MAILER_HOST = process.env.MAILER_HOST || '';
export const MAILER_PORT = process.env.MAILER_PORT || '';
export const MAILER_USER = process.env.MAILER_USER || '';
export const MAILER_PASSWORD = process.env.MAILER_PASSWORD || '';
export const MAILER_SECURE = process.env.MAILER_SECURE || 'false';

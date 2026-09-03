import dotenv from 'dotenv';
import { resolve } from 'node:path';

const envPath = resolve(import.meta.dirname, '../../../.env');
console.log('[preload] loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('[preload] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
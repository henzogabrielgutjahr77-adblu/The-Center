import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Carrega o .env da raiz do monorepo ANTES de qualquer import que use config.
dotenv.config({ path: resolve(import.meta.dirname, '../../../../.env') });

import './index.js';
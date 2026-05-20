/**
 * Carga datos extra de explore (seeds/seed_explore_more.sql).
 * Requiere DATABASE_URL en .env
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '..', 'seeds', 'seed_explore_more.sql');

const url = process.env.DATABASE_URL;
if (!url) {
    console.error('Falta DATABASE_URL en .env');
    process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const client = new pg.Client({ connectionString: url });

try {
    await client.connect();
    await client.query(sql);
    console.log('Seed explore aplicado:', sqlPath);
} catch (e) {
    console.error(e);
    process.exit(1);
} finally {
    await client.end();
}

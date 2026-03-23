import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            // Evita caracteres como á/ó mostrándose como "?" (encoding)
            options: '-c client_encoding=UTF8',
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: false,
            options: '-c client_encoding=UTF8',
        }
);

pool.on('connect', (client) => {
    client.query("SET client_encoding TO 'UTF8'").catch(() => {});
});

pool.connect()
    .then(() => console.log('PostgreSQL conectado'))
    .catch((err) => console.error('Error conectando DB:', err));

export default pool;

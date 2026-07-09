import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 1, // CRITICAL for Vercel serverless
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

// Connection test on startup (only in dev, not serverless cold start)
if (process.env.NODE_ENV !== 'production') {
  pool.query('SELECT NOW()')
    .then(() => console.log('Database connected successfully'))
    .catch(err => {
      console.error('Database connection failed:', err.message);
      process.exit(1);
    });
}

pool.on('error', (err) => console.error('Unexpected DB error', err));

export default pool;

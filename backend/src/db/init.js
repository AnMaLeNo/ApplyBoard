import pg from 'pg';

const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY,
        url TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_offers (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
        apply BOOLEAN DEFAULT FALSE,
        answer BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (user_id, offer_id)
      );
    `);
  } finally { // y pas de catch ?
    client.release();
  }
};

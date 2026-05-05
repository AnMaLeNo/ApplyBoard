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
        url TEXT UNIQUE NOT NULL,
        title VARCHAR(255),
        company VARCHAR(255),
        short_description TEXT,
        full_description TEXT,
        salary VARCHAR(255),
        contract_type VARCHAR(255),
        email VARCHAR(255),
        address TEXT,
        availability VARCHAR(255),
        campus VARCHAR(255),
        expertises VARCHAR(255),
        target VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at DESC);

      CREATE TABLE IF NOT EXISTS user_offers (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
        apply BOOLEAN DEFAULT FALSE,
        answer BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (user_id, offer_id)
      );

      CREATE TABLE IF NOT EXISTS cv_modules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind VARCHAR(32) NOT NULL
          CHECK (kind IN ('title','headline','education','projects',
                          'hackathons','interests','skills','experience','custom')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_cv_modules_user_created
        ON cv_modules(user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS cv_module_variants (
        id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL REFERENCES cv_modules(id) ON DELETE CASCADE,
        label VARCHAR(255) NOT NULL,
        content JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_cv_module_variants_module
        ON cv_module_variants(module_id, created_at DESC);
    `);
  } finally { // y pas de catch ?
    client.release();
  }
};

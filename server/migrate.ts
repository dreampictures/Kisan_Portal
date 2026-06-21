import { Pool } from "pg";

export async function runMigrations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        card_number TEXT UNIQUE,
        name TEXT NOT NULL,
        designation TEXT DEFAULT 'ਮੈਂਬਰ',
        village TEXT NOT NULL,
        tehsil TEXT NOT NULL,
        district TEXT NOT NULL,
        area_type TEXT DEFAULT 'rural',
        ward_number TEXT,
        mohalla TEXT,
        mobile_number TEXT,
        aadhaar_number TEXT,
        photo_url TEXT,
        photo_data TEXT,
        photo_mime_type TEXT,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS updates (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        event_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        page TEXT NOT NULL,
        viewed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS area_type TEXT DEFAULT 'rural';
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ward_number TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mohalla TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS photo_data TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS photo_mime_type TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS card_number TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'ਮੈਂਬਰ';
    `);

    console.log("[migrate] All tables ready");
  } catch (err) {
    console.error("[migrate] Migration error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

import { Pool } from "pg";
import bcrypt from "bcryptjs";

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

      CREATE TABLE IF NOT EXISTS staff_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS delete_requests (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL,
        member_name TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        requested_by_role TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_by TEXT,
        resolved_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        member_id INTEGER,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        role TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        remarks TEXT
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

      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tracking_id TEXT UNIQUE;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'submitted';
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meet_president_status TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meet_president_by TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meet_president_at TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS state_president_status TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS state_president_by TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS state_president_at TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_status TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_by TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_at TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS rejected_by TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS created_by TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS created_by_role TEXT;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS photo_size INTEGER;
    `);

    await client.query(`
      UPDATE registrations
      SET current_stage = 'card_issued'
      WHERE status = 'approved' AND card_number IS NOT NULL AND current_stage = 'submitted';

      UPDATE registrations
      SET tracking_id = 'TRK-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
      WHERE tracking_id IS NULL;

      UPDATE registrations
      SET submitted_at = created_at
      WHERE submitted_at IS NULL;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS registrations_tracking_id_key ON registrations (tracking_id) WHERE tracking_id IS NOT NULL;
    `);

    // Hash any plain-text passwords in staff_users (those not starting with $2b$)
    const users = await client.query(`SELECT id, password FROM staff_users`);
    for (const row of users.rows) {
      if (row.password && !row.password.startsWith("$2b$") && !row.password.startsWith("$2a$")) {
        const hashed = await bcrypt.hash(row.password, 12);
        await client.query(`UPDATE staff_users SET password = $1 WHERE id = $2`, [hashed, row.id]);
        console.log(`[migrate] Hashed password for staff_user id=${row.id}`);
      }
    }

    console.log("[migrate] All tables ready");
  } catch (err) {
    console.error("[migrate] Migration error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

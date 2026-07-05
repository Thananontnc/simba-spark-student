const { Pool } = require('pg');
require('@next/env').loadEnvConfig(process.cwd());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('Connecting to database...');
  
  console.log('Safely adding missing columns to existing tables (if they do not already exist)...');
  
  // ALTER TABLE ADD COLUMN IF NOT EXISTS is safe: it adds the column if missing,
  // and does nothing (no error) if the column is already there. No data is lost!
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS gpa NUMERIC(3,2);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INT;
    
    ALTER TABLE sections ADD COLUMN IF NOT EXISTS start_time TIME;
    ALTER TABLE sections ADD COLUMN IF NOT EXISTS end_time TIME;
    
    UPDATE sections SET start_time = '09:00:00', end_time = '10:30:00' WHERE id = 1 AND start_time IS NULL;
    UPDATE sections SET start_time = '12:00:00', end_time = '13:30:00' WHERE id = 2 AND start_time IS NULL;
  `);

  console.log('Database tables successfully updated! No tables were dropped, and no data was deleted.');
  await pool.end();
}

main().catch(err => {
  console.error('Failed to update database tables:', err);
  process.exit(1);
});

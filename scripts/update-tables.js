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
    
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS faculty TEXT;
  `);

  console.log('Database tables successfully updated! No tables were dropped, and no data was deleted.');
  await pool.end();
}

main().catch(err => {
  console.error('Failed to update database tables:', err);
  process.exit(1);
});

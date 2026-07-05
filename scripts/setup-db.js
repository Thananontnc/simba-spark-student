const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('@next/env').loadEnvConfig(process.cwd());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('Connecting to database...');
  
  const schemaSql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
  const seedSql = fs.readFileSync(path.join(__dirname, '../seed.sql'), 'utf8');

  console.log('Dropping existing tables to start fresh...');
  await pool.query(`
    DROP TABLE IF EXISTS bookings CASCADE;
    DROP TABLE IF EXISTS enrollments CASCADE;
    DROP TABLE IF EXISTS sections CASCADE;
    DROP TABLE IF EXISTS timeframes CASCADE;
    DROP TABLE IF EXISTS courses CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  console.log('Applying schema.sql...');
  await pool.query(schemaSql);

  console.log('Applying seed.sql...');
  await pool.query(seedSql);

  console.log('Database successfully initialized and seeded!');
  await pool.end();
}

main().catch(err => {
  console.error('Failed to setup database:', err);
  process.exit(1);
});

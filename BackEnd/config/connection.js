const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error(' Database connection failed:', err.message);
    } else {
        console.log('Connected to PostgreSQL (Supabase) successfully!');
        release();
    }
});

module.exports = pool;
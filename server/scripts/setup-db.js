require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('Users table exists:', tableExists);
    
    if (!tableExists) {
      // Create users table
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'user' NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Users table created');
    }
    
    // Check if admin user exists
    const adminCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM users 
        WHERE username = 'admin'
      );
    `);
    
    const adminExists = adminCheck.rows[0].exists;
    console.log('Admin user exists:', adminExists);
    
    if (!adminExists) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await pool.query(`
        INSERT INTO users (name, username, password, role)
        VALUES ('Admin User', 'admin', $1, 'admin');
      `, [hashedPassword]);
      console.log('Admin user created');
    }
    
    console.log('Database setup complete');
  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    pool.end();
  }
}

setupDatabase();
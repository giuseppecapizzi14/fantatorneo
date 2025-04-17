require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetAdminPassword() {
  try {
    // Generate a new hashed password for 'admin123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Update the admin user's password
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING *',
      [hashedPassword, 'admin']
    );
    
    if (result.rows.length > 0) {
      console.log('Admin password reset successfully');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Admin user not found');
    }
  } catch (err) {
    console.error('Error resetting admin password:', err);
  } finally {
    pool.end();
  }
}

resetAdminPassword();
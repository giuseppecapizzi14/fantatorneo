require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetUserPassword() {
  try {
    // Genera una nuova password hashata (puoi cambiare 'nuova_password' con la password che preferisci)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('nuova_password', salt);
    
    // Aggiorna la password dell'utente giuseppe_capizzi
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING *',
      [hashedPassword, 'giuseppe_capizzi']
    );
    
    if (result.rows.length > 0) {
      console.log('Password reimpostata con successo');
      console.log('Username: giuseppe_capizzi');
      console.log('Password: Giuseppe14');
    } else {
      console.log('Utente non trovato');
    }
  } catch (err) {
    console.error('Errore durante la reimpostazione della password:', err);
  } finally {
    pool.end();
  }
}

resetUserPassword();
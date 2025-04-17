const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Disabilita la verifica del certificato SSL
  ssl: false
});

const initDb = async () => {
  let client;
  try {
    // Testa la connessione prima di eseguire lo script
    client = await pool.connect();
    console.log('Connessione al database riuscita');
    
    // Leggi e esegui lo script SQL
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    await client.query(sql);
    console.log('Database inizializzato con successo');
  } catch (err) {
    console.error('Errore durante l\'inizializzazione del database:', err);
  } finally {
    if (client) client.release();
    // Chiudi il pool di connessione
    await pool.end();
    process.exit(0);
  }
};

initDb();
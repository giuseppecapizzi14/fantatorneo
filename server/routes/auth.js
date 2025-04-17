const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Add this import at the top of the file
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', auth, async (req, res) => {
  try {
    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli amministratori possono registrare nuovi utenti' });
    }

    const { name, username, password, role } = req.body;

    // Check if user already exists
    let user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (user.rows.length > 0) {
      return res.status(400).json({ message: 'Utente già esistente' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role',
      [name, username, hashedPassword, role || 'user']
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
// Login route - add console logs for debugging
// Add more detailed logging to the login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('User query result rows:', user.rows.length);
    
    if (user.rows.length === 0) {
      console.log('User not found');
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.rows[0].id,
        role: user.rows[0].role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'yourJwtSecretKey',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        console.log('Login successful for user:', username);
        res.json({ 
          token,
          user: {
            id: user.rows[0].id,
            name: user.rows[0].name,
            username: user.rows[0].username,
            role: user.rows[0].role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
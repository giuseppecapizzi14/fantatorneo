const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://fantamazzarinosummercup.fun'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());

// Database connection
// Update the database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // This is important for Supabase connections
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes will be added here
// Auth routes
app.use('/api/auth', require('./routes/auth'));
// User routes
app.use('/api/users', require('./routes/users'));
// Team routes
app.use('/api/teams', require('./routes/teams'));
// Players routes
app.use('/api/players', require('./routes/players'));
// Bonus routes
app.use('/api/bonus', require('./routes/bonus'));
// Leaderboard routes
app.use('/api/leaderboard', require('./routes/leaderboard'));
// Calendar routes
app.use('/api/calendar', require('./routes/calendar'));

// Try to start the server with error handling for port conflicts
const startServer = (port) => {
  app.listen(port)
    .on('listening', () => {
      console.log(`Server running on port ${port}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
};

startServer(PORT);
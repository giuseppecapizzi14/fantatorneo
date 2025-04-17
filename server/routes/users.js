const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all users (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await pool.query('SELECT id, name, username, role FROM users');
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Regular users can only access their own data
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await pool.query(
      'SELECT id, name, username, role FROM users WHERE id = $1',
      [id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, role } = req.body;
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    let query, params;
    
    if (password) {
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      query = 'UPDATE users SET name = $1, username = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, name, username, role';
      params = [name, username, hashedPassword, role, id];
    } else {
      query = 'UPDATE users SET name = $1, username = $2, role = $3 WHERE id = $4 RETURNING id, name, username, role';
      params = [name, username, role, id];
    }
    
    const updatedUser = await pool.query(query, params);
    
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const jwt = require('jsonwebtoken');
// Replace config with direct import of JWT secret
// You can either use environment variables or a local config file

// Option 1: Using a JWT secret directly (less secure but simpler for development)
const JWT_SECRET = 'yourJwtSecretKey'; // Replace with a secure secret in production

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Use the direct secret instead of config.get
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
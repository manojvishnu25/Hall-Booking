const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'college_hall_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin privilege required' });
  }
}

function requireDepartment(req, res, next) {
  if (req.user && (req.user.role === 'department' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Department access required' });
  }
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalToken,
  requireAdmin,
  requireDepartment
};

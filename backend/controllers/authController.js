const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Admin Login
function adminLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const validPassword = bcrypt.compareSync(password, admin.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Admin login successful',
    token,
    user: {
      id: admin.id,
      username: admin.username,
      role: 'admin'
    }
  });
}

// Department Login
function departmentLogin(req, res) {
  const { department_code, password } = req.body;

  if (!department_code || !password) {
    return res.status(400).json({ error: 'Department ID and password are required' });
  }

  const dept = db.prepare('SELECT * FROM departments WHERE department_code = ?').get(department_code.toUpperCase().trim());
  if (!dept) {
    return res.status(401).json({ error: 'Invalid Department ID or Password' });
  }

  if (dept.status !== 'active') {
    return res.status(403).json({ error: 'Department account is deactivated. Contact Administrator.' });
  }

  const validPassword = bcrypt.compareSync(password, dept.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid Department ID or Password' });
  }

  const token = jwt.sign(
    {
      id: dept.id,
      department_code: dept.department_code,
      department_name: dept.department_name,
      role: 'department'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Department login successful',
    token,
    user: {
      id: dept.id,
      department_code: dept.department_code,
      department_name: dept.department_name,
      role: 'department'
    }
  });
}

// Get Profile
function getProfile(req, res) {
  if (req.user.role === 'admin') {
    const admin = db.prepare('SELECT id, username, created_at FROM admins WHERE id = ?').get(req.user.id);
    return res.json({ ...admin, role: 'admin' });
  }

  if (req.user.role === 'department') {
    const dept = db.prepare('SELECT id, department_code, department_name, status, created_at FROM departments WHERE id = ?').get(req.user.id);
    return res.json({ ...dept, role: 'department' });
  }

  res.status(400).json({ error: 'Unknown role' });
}

module.exports = {
  adminLogin,
  departmentLogin,
  getProfile
};

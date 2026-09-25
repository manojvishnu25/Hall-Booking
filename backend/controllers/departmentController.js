const db = require('../config/db');
const bcrypt = require('bcryptjs');

function getAllDepartments(req, res) {
  try {
    const depts = db.prepare('SELECT id, department_code, department_name, status, created_at FROM departments ORDER BY department_code ASC').all();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createDepartment(req, res) {
  const { department_code, department_name, password } = req.body;

  if (!department_code || !department_name || !password) {
    return res.status(400).json({ error: 'Department code, name, and password are required' });
  }

  const codeUpper = department_code.toUpperCase().trim();

  try {
    const existing = db.prepare('SELECT id FROM departments WHERE department_code = ?').get(codeUpper);
    if (existing) {
      return res.status(400).json({ error: `Department code ${codeUpper} already exists` });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const stmt = db.prepare('INSERT INTO departments (department_code, department_name, password_hash, status) VALUES (?, ?, ?, ?)');
    const info = stmt.run(codeUpper, department_name.trim(), password_hash, 'active');

    res.status(201).json({
      message: 'Department created successfully',
      id: info.lastInsertRowid,
      department_code: codeUpper,
      department_name: department_name.trim(),
      status: 'active'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateDepartment(req, res) {
  const { id } = req.params;
  const { department_name, password, status } = req.body;

  try {
    const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    let password_hash = dept.password_hash;
    if (password && password.trim().length > 0) {
      const salt = bcrypt.genSaltSync(10);
      password_hash = bcrypt.hashSync(password, salt);
    }

    const updatedName = department_name ? department_name.trim() : dept.department_name;
    const updatedStatus = status || dept.status;

    db.prepare('UPDATE departments SET department_name = ?, password_hash = ?, status = ? WHERE id = ?')
      .run(updatedName, password_hash, updatedStatus, id);

    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function deleteDepartment(req, res) {
  const { id } = req.params;
  try {
    const info = db.prepare('DELETE FROM departments WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllDepartments);
router.post('/', authenticateToken, requireAdmin, createDepartment);
router.put('/:id', authenticateToken, requireAdmin, updateDepartment);
router.delete('/:id', authenticateToken, requireAdmin, deleteDepartment);

module.exports = router;

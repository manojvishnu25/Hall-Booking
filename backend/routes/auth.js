const express = require('express');
const router = express.Router();
const { adminLogin, departmentLogin, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/admin/login', adminLogin);
router.post('/department/login', departmentLogin);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;

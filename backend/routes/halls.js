const express = require('express');
const router = express.Router();
const {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
  getHallAvailability
} = require('../controllers/hallController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllHalls);
router.get('/availability', getHallAvailability);
router.get('/:id', getHallById);
router.post('/', authenticateToken, requireAdmin, createHall);
router.put('/:id', authenticateToken, requireAdmin, updateHall);
router.delete('/:id', authenticateToken, requireAdmin, deleteHall);

module.exports = router;

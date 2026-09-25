const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  checkConflictEndpoint
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', getBookings);
router.get('/check-conflict', checkConflictEndpoint);
router.get('/:id', authenticateToken, getBookingById);
router.post('/', authenticateToken, createBooking);
router.put('/:id', authenticateToken, updateBooking);
router.delete('/:id', authenticateToken, cancelBooking);

module.exports = router;

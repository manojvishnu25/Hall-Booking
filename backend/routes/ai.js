const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalToken } = require('../middleware/authMiddleware');

// Chat endpoint (optional authentication so guests & dept users can both interact)
router.post('/chat', optionalToken, aiController.processAiChat);

// Hall insights endpoint
router.get('/insights', aiController.getAiInsights);

module.exports = router;

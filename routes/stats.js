const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { usersByRole, loginStats, activeUsers } = require('../controllers/statsController');

router.use(protect);
router.get('/users', authorize('admin','manager'), usersByRole);
router.get('/logins', authorize('admin','manager'), loginStats);
router.get('/active-users', authorize('admin','manager'), activeUsers);

module.exports = router;
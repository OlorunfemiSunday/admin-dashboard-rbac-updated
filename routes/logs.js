const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getLogs, exportLogs, deleteLog } = require('../controllers/logController');

router.use(protect);
router.get('/', authorize('admin','manager'), getLogs);
router.get('/export', authorize('admin','manager'), exportLogs);
router.delete('/:id', authorize('admin'), deleteLog);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/userController');

router.use(protect);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin','manager'), getUserById);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
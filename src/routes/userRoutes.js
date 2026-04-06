const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Only Admins can manage users
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('Admin'));

router.get('/', userController.getAllUsers);
router.put('/:id/role', userController.updateUserRole);
router.put('/:id/status', userController.updateUserStatus);

module.exports = router;

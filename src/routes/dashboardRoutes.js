const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('Analyst', 'Admin'));

router.get('/summary', dashboardController.getSummary);

module.exports = router;

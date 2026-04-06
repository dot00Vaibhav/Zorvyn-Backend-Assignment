const express = require('express');
const recordController = require('../controllers/recordController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All record routes require authentication
router.use(authMiddleware.protect);

// Analysts and Admins can view records
router.get('/', authMiddleware.restrictTo('Analyst', 'Admin'), recordController.getAllRecords);
router.get('/:id', authMiddleware.restrictTo('Analyst', 'Admin'), recordController.getRecord);

// Only Admins can modify/create records
router.use(authMiddleware.restrictTo('Admin'));
router.post('/', recordController.createRecord);
router.put('/:id', recordController.updateRecord);
router.delete('/:id', recordController.deleteRecord);

module.exports = router;

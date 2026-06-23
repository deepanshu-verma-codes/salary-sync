const express = require('express');
const router = express.Router();
const controller = require('../controllers/payslipController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.createPayslip);
router.get('/', authenticate, controller.getPayslips);

module.exports = router;

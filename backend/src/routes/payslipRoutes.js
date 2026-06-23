const express = require('express');
const router = express.Router();
const controller = require('../controllers/payslipController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.createPayslip);
router.get('/', authenticate, controller.getPayslips);
router.put('/:id', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.updatePayslip);
router.delete('/:id', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.deletePayslip);

module.exports = router;

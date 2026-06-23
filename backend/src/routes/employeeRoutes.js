const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.getStats);
router.get('/distribution/department', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.getDistributionByDepartment);
router.get('/distribution/country', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.getDistributionByCountry);
router.get('/', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.getEmployees);
router.get('/:id', authenticate, controller.getEmployeeById);

router.post('/', authenticate, requireRole(['ADMIN', 'SUBADMIN']), controller.addUser);
router.delete('/:id', authenticate, requireRole(['ADMIN']), controller.deleteUser);
router.put('/:id/role', authenticate, requireRole(['ADMIN']), controller.updateRole);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');

router.get('/stats', controller.getStats);
router.get('/distribution/department', controller.getDistributionByDepartment);
router.get('/distribution/country', controller.getDistributionByCountry);
router.get('/', controller.getEmployees);
router.get('/:id', controller.getEmployeeById);

module.exports = router;

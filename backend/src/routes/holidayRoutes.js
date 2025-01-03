const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');

// Rute pentru perioade
router.get('/', holidayController.getAllHolidays);
router.get('/sofer/:soferId', holidayController.getDriverHolidays);
router.post('/', holidayController.createHoliday);
router.post('/:id/diurna', holidayController.addDiurna);
router.get('/zile-in-tara/:soferId', holidayController.calculateZileInTara);
router.get('/total-diurna/:soferId', holidayController.calculateTotalDiurna);

module.exports = router;
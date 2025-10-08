const express = require('express');
const router = express.Router();
const { getAlarms, createAlarm, updateAlarm, deleteAlarm } = require('../controllers/alarmController');
const auth = require('../middleware/auth');

router.get('/', auth, getAlarms);
router.post('/', auth, createAlarm);
router.put('/:id', auth, updateAlarm);
router.delete('/:id', auth, deleteAlarm);

module.exports = router;
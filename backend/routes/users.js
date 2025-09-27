const express = require('express');
const { updateProfile, updatePreferences } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);

module.exports = router;
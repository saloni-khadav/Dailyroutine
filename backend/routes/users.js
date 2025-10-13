const express = require('express');
const { updateProfile, updatePreferences, deleteAccount } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);
router.delete('/account', deleteAccount);

module.exports = router;
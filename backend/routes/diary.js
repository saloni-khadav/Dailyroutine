const express = require('express');
const { getDiaryEntries, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry } = require('../controllers/diaryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getDiaryEntries);
router.post('/', createDiaryEntry);
router.put('/:id', updateDiaryEntry);
router.delete('/:id', deleteDiaryEntry);

module.exports = router;
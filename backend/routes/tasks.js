const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/stats', getTaskStats);

module.exports = router;
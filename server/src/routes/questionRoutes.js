const express = require('express');
const router = express.Router();
const { createQuestion, getQuestions, getQuestionById, deleteQuestion, importQuestions } = require('../controllers/questionController');

router.post('/import', importQuestions);
router.post('/', createQuestion);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.delete('/:id', deleteQuestion);

module.exports = router;

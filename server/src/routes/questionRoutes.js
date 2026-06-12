const express = require('express');
const router = express.Router();
const { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion, importQuestions, bulkDeleteQuestions } = require('../controllers/questionController');

router.post('/import', importQuestions);
router.post('/bulk-delete', bulkDeleteQuestions);
router.post('/', createQuestion);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;

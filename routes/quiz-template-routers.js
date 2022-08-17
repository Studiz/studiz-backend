const express = require('express');
const { createQuiz, updateQuiz, deleteQuiz, getQuizById } = require('../controllers/quizTemplateController');

const router = express.Router();

router.post('/create/quiz',createQuiz);
router.put('/update/quiz/:id',updateQuiz);
router.delete('/delete/quiz/:id',deleteQuiz);
router.get('/get/quiz/:id',getQuizById);


module.exports = {
    routes: router
}
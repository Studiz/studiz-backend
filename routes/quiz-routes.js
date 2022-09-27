const express = require('express');
const {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    joinQuiz,
    getQuizByIdForStudent
} = require('../controllers/quizController');

const router = express.Router();

router.post('/create/quiz', createQuiz);
router.put('/update/quiz/:id', updateQuiz);
router.delete('/delete/quiz/:id', deleteQuiz);
router.get('/get/quiz/:id', getQuizById);
router.patch('/joinQuiz/:pinCode', joinQuiz);
router.get('/get/quizForStudent/:id', getQuizByIdForStudent);

module.exports = {
    routes: router
}
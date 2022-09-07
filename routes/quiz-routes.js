const express = require('express');
const {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    addStudentToQuiz
} = require('../controllers/quizController');

const router = express.Router();

router.post('/create/quiz', createQuiz);
router.put('/update/quiz/:id', updateQuiz);
router.delete('/delete/quiz/:id', deleteQuiz);
router.get('/get/quiz/:id', getQuizById);
router.patch('/addStudent/:quizId', addStudentToQuiz);


module.exports = {
    routes: router
}
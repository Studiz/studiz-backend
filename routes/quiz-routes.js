const express = require('express');
const {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    joinQuiz,
    getQuizByIdForStudent,
    deletePinCode
} = require('../controllers/quizController');

const router = express.Router();

router.post('/create/quiz', createQuiz);
router.put('/update/quiz/:id', updateQuiz);
router.delete('/delete/quiz/:id', deleteQuiz);
router.get('/get/quiz/:id', getQuizById);
router.post('/joinQuiz/:pinCode', joinQuiz);
router.get('/get/quizForStudent/:id', getQuizByIdForStudent);
router.delete('/quiz/deletePinCode/:quizId', deletePinCode);

module.exports = {
    routes: router
}
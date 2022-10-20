const express = require('express');
const { getQuizHistoryByQuizId, getQuizHistoryById, getQuizHistoryByStudentUid } = require('../controllers/quizHistoryController');
const router = express.Router();

router.get('/get/quizHistory/quizId/:id', getQuizHistoryByQuizId);
router.get('/get/quizHistory/:id',getQuizHistoryById);
router.get('/get/quizHistory/studentUid/:uid',getQuizHistoryByStudentUid);


module.exports = {
    routes: router
}
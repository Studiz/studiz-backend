const express = require('express');
const { getQuizHistoryByQuizId, getQuizHistoryById, getQuizHistoryByStudentUid,getQuizHistoryByTeacherId } = require('../controllers/quizHistoryController');
const router = express.Router();

router.get('/get/quizHistory/quizId/:id', getQuizHistoryByQuizId);
router.get('/get/quizHistory/:id',getQuizHistoryById);
router.get('/get/quizHistory/studentUid/:uid',getQuizHistoryByStudentUid);
router.get('/get/quizHistory/teacherId/:id',getQuizHistoryByTeacherId);


module.exports = {
    routes: router
}
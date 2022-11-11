const express = require('express');
const { getQuizHistoryByQuizId, getQuizHistoryById, getQuizHistoryByStudentUid,getQuizHistoryByTeacherId, getQuizHistoryByClassroomId } = require('../controllers/quizHistoryController');
const router = express.Router();

router.get('/get/quizHistory/quizId/:id', getQuizHistoryByQuizId);
router.get('/get/quizHistory/:id',getQuizHistoryById);
router.get('/get/quizHistory/studentUid/:uid',getQuizHistoryByStudentUid);
router.get('/get/quizHistory/teacherId/:id',getQuizHistoryByTeacherId);
router.get('/get/quizHistory/classroomId/:id',getQuizHistoryByClassroomId);

module.exports = {
    routes: router
}
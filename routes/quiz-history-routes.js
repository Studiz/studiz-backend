const express = require('express');
const { getQuizHistoryByQuizId, getQuizHistoryById } = require('../controllers/quizHistoryController');
const router = express.Router();

router.get('/get/quizHistory/quizId/:id', getQuizHistoryByQuizId);
router.get('/get/quizHistory/:id',getQuizHistoryById);

module.exports = {
    routes: router
}
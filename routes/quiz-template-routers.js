const express = require('express');
const { createQuizTemplate, updateQuizTemplate, deleteQuizTemplate, getQuizTemplateById, getQuizTemplateByTeacherId } = require('../controllers/quizTemplateController');

const router = express.Router();

router.post('/create/quizTemplate',createQuizTemplate);
router.put('/update/quizTemplate/:id',updateQuizTemplate);
router.delete('/delete/quizTemplate/:id',deleteQuizTemplate);
router.get('/get/quizTemplate/:id',getQuizTemplateById);
router.get('/get/quizTemplate/teacherId/:id',getQuizTemplateByTeacherId);

module.exports = {
    routes: router
}
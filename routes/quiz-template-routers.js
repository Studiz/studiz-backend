const express = require('express');
const { createQuizTemplate, updateQuizTemplate, deleteQuizTemplate, getQuizTemplateById } = require('../controllers/quizTemplateController');

const router = express.Router();

router.post('/create/quizTemplate',createQuizTemplate);
router.put('/update/quizTemplate/:id',updateQuizTemplate);
router.delete('/delete/quizTemplate/:id',deleteQuizTemplate);
router.get('/get/quizTemplate/:id',getQuizTemplateById);


module.exports = {
    routes: router
}
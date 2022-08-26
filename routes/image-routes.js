const express = require('express');
const { uploadImageForStudent, uploadImageForQuiz, deleteImage } = require('../controllers/imageController');
const router = express.Router();

// router.post('/upload/image',uploadImage);
router.post('/upload/student/image/:id', uploadImageForStudent);
router.post('/upload/quiz/image/:id/:no', uploadImageForQuiz);
router.delete('/delete/image', deleteImage);

module.exports = {
    routes: router
}
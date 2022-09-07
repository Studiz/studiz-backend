const express = require('express');
const { uploadImageForStudent,  deleteImage, updateImageForQuiz, uploadImageForQuiz } = require('../controllers/imageController');
const router = express.Router();

// router.post('/upload/image',uploadImage);
router.post('/upload/student/image/:id', uploadImageForStudent);
router.put('/update/quiz/image/:id/:no', updateImageForQuiz);
router.delete('/delete/image', deleteImage);
router.post('/upload/quiz/image', uploadImageForQuiz);

module.exports = {
    routes: router
}
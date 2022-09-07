const express = require('express');
const { uploadImageForStudent,  deleteImage, uploadImage, updateImageForQuizTemplate } = require('../controllers/imageController');
const router = express.Router();

// router.post('/upload/image',uploadImage);
router.post('/upload/student/image/:id', uploadImageForStudent);
router.put('/update/quizTemplate/image/:id/:no', updateImageForQuizTemplate);
router.delete('/delete/image', deleteImage);
router.post('/upload/image', uploadImage);

module.exports = {
    routes: router
}
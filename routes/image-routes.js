const express = require('express');
const { uploadImageForStudent } = require('../controllers/imageController');
const router = express.Router();

// router.post('/upload/image',uploadImage);
router.post('/upload/student/image/:id', uploadImageForStudent);



module.exports = {
    routes: router
}
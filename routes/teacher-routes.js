const express = require('express');
const { addTeacher, getTeacherById } = require('../controllers/teacherController');

const router = express.Router();

router.post('/teacher/signup', addTeacher);
router.get('/teacher/:id', getTeacherById);

module.exports = {
    routes: router
}
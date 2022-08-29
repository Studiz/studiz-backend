const express = require('express');
const { addTeacher, getTeacherById, updateTeacher } = require('../controllers/teacherController');

const router = express.Router();

router.post('/teacher/signup/withEmail', signUpTeacherWithEmail);
router.post('/teacher/signup/withGoogle', signUpTeacherWithGoogle);
// router.post('/teacher/signup', addTeacher);
router.get('/teacher/:id', getTeacherById);
router.put('/teacher/:id', updateTeacher);

module.exports = {
    routes: router
}
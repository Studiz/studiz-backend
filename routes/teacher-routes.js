const express = require('express');
const {
    getTeacherById,
    updateTeacher,
    signUpTeacherWithEmail,
    signUpTeacherWithGoogle
} = require('../controllers/teacherController');

const router = express.Router();

router.post('/teacher/signup/withEmail', signUpTeacherWithEmail);
router.post('/teacher/signup/withGoogle', signUpTeacherWithGoogle);
// router.post('/teacher/signup', addTeacher);
router.get('/teacher/:id', getTeacherById);
router.put('/update/teacher/:id', updateTeacher);

module.exports = {
    routes: router
}
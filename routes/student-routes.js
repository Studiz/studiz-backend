const express = require('express');
const {signUpStudenWithEmail, 
       getAllStudents, 
       getStudent,
       updateStudent,
       deleteStudent
      } = require('../controllers/studentController');

const router = express.Router();

router.post('/student/signup/withEmail', signUpStudenWithEmail);
router.get('/students', getAllStudents);
router.get('/student/:id', getStudent);
router.put('/update/student/:id', updateStudent);
router.delete('/student/:id', deleteStudent);


module.exports = {
    routes: router
}
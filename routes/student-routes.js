const express = require('express');
const {
    signUpStudenWithEmail,
    signUpStudenWithGoogle,
    getAllStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    buyItem,
} = require('../controllers/studentController');

const router = express.Router();

router.post('/student/signup/withEmail', signUpStudenWithEmail);
router.post('/student/signup/withGoogle', signUpStudenWithGoogle);
router.get('/students', getAllStudents);
router.get('/student/:id', getStudent);
router.put('/update/student/:id', updateStudent);
router.delete('/student/:id', deleteStudent);
router.put('/buy/item', buyItem);


module.exports = {
    routes: router
}
const express = require('express');
const {createClassroom, getClassroomByPinCode, joinClassroom, leftClassroom, generatePinCode, deletePinCode, deleteClassroom, getStudentByClassroomId, updateClassroom, getClassroomById, kickStudntInClassroom, kickAllStudntInClassroom
      } = require('../controllers/classroomController');

const router = express.Router();

router.post('/create/classroom', createClassroom);
router.get('/classroom/pincode/:pinCode', getClassroomByPinCode);
router.get('/students/classroom/:classroomId', getStudentByClassroomId);
router.put('/join/classroom/:pinCode/:studentId', joinClassroom);
router.delete('/leftClassroom/:classroomId/:studentId', leftClassroom);
router.get('/getPinCode/:classroomId', generatePinCode);
router.delete('/deletePinCode/:classroomId', deletePinCode);
router.delete('/classroom/:id', deleteClassroom);
router.put('/update/classroom/:id', updateClassroom);
router.get('/getClassroom/byClassroomId/:id', getClassroomById);
router.delete('/kick/student/:classroomId/:studentId', kickStudntInClassroom);
router.delete('/kick/allStudent/:classroomId', kickAllStudntInClassroom);

module.exports = {
    routes: router
}
const express = require('express');
const {addClassroom, getClassroomByPinCode, joinClassroom, leftClassroom, generatePinCode, deletePinCode, deleteClassroom, getStudentByClassroomId, updateClassroom
      } = require('../controllers/classroomController');

const router = express.Router();

router.post('/create/classroom', addClassroom);
router.get('/classroom/pincode/:pinCode', getClassroomByPinCode);
router.get('/students/classroom/:classroomId', getStudentByClassroomId);
router.put('/join/classroom/:pinCode/:studentId', joinClassroom);
router.delete('/leftClassroom/:classroomId/:studentId', leftClassroom);
router.get('/getPinCode/:classroomId', generatePinCode);
router.delete('/deletePinCode/:classroomId', deletePinCode);
router.delete('/classroom/:id', deleteClassroom);
router.put('/update/classroom/:id', updateClassroom);

module.exports = {
    routes: router
}
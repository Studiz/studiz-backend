const express = require('express');
const {addClassroom, getClassroomByPinCode, joinClassroom, leftClassroom, generatePinCode, deletePinCode, deleteClassroom
      } = require('../controllers/classroomController');

const router = express.Router();

router.post('/classroom', addClassroom);
router.get('/classroom/:pinCode', getClassroomByPinCode);
router.put('/classroom/:pinCode/:studentId', joinClassroom);
router.delete('/leftClassroom/:classroomId/:studentId', leftClassroom);
router.get('/getPinCode/:classroomId', generatePinCode);
router.delete('/deletePinCode/:classroomId', deletePinCode);
router.delete('/classroom/:id', deleteClassroom);

module.exports = {
    routes: router
}
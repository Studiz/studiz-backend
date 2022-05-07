const express = require('express');
const {addClassroom, getClassroomByPinCode, joinClassroom, leftClassroom
      } = require('../controllers/classroomController');

const router = express.Router();

router.post('/classroom', addClassroom);
router.get('/classroom/:pinCode', getClassroomByPinCode);
router.put('/classroom/:pinCode/:studentId', joinClassroom);
router.delete('/leftClassroom/:classroomId/:studentId', leftClassroom);

module.exports = {
    routes: router
}
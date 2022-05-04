const express = require('express');
const {addClassroom, getClassroomByPinCode, joinClassroom
      } = require('../controllers/classroomController');

const router = express.Router();

router.post('/classroom', addClassroom);
router.get('/classroom/:pinCode', getClassroomByPinCode);
router.put('/classroom/:pinCode/:studentId', joinClassroom);

module.exports = {
    routes: router
}
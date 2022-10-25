const express = require('express');
const { getNotificationByStudentId, addNotification, readNotification, deleteNotification } = require('../controllers/notificationController');
const router = express.Router();

router.get('/get/notification/studentUid/:uid', getNotificationByStudentId);
router.post('/add/notification',addNotification);
router.put('/read/notification/:id',readNotification);
router.delete('/delete/notification/:id',deleteNotification);

module.exports = {
    routes: router
}
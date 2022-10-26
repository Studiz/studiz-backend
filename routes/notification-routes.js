const express = require('express');
const { addNotification, readNotification, deleteNotification,getNotificationByClassroomsId, getNotificationByUid } = require('../controllers/notificationController');
const router = express.Router();

router.post('/add/notification',addNotification);
router.put('/read/notification/:id',readNotification);
router.delete('/delete/notification/:id',deleteNotification);
router.get('/get/notification/classroomsId', getNotificationByClassroomsId);
router.get('/get/notification/uid/:uid', getNotificationByUid);

module.exports = {
    routes: router
}
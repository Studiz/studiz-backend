const express = require('express');
const { getNotificationById, addNotification } = require('../controllers/notificationController');
const router = express.Router();

router.get('/get/notification/:id', getNotificationById);
router.post('/add/notification',addNotification);


module.exports = {
    routes: router
}
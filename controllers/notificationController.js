'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');

const addNotification = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }

        const uid = decodeToken.user_id
        const notification = req.body
        notification.uid = uid
        await firestore.collection('notifications').add(notification);
        res.status(200).send(notification);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getNotificationByStudentId = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }

        const studentUid = req.params.uid;
        const notifications = await firestore.collection('notifications');
        const data = await notifications.get();
        const notificationsArray = []
        data.forEach(doc => {
            if (doc.data().uid === studentUid) {
                let notification = doc.data()
                notification.id = doc.id
                notificationsArray.push(notification);
            }
        });

        if (notificationsArray.length === 0) {
            res.status(404).send('notification with the given studentUid not found');
        } else {
            res.send(notificationsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteNotification = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }

        const id = req.params.id;
        await firestore.collection('notifications').doc(id).delete();
        res.send('notification record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const readNotification = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }
    
        const id = req.params.id;
        const notifications = await firestore.collection('notifications').doc(id);
        const getnotification = await notifications.get()
        const notificationData = getnotification.data()
        if(notificationData) {
        notificationData.isRead = true
        await notifications.update(notificationData);
        res.send('notification record updated successfuly');
        }else res.status(404).send("notification with the given id not found");
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addNotification,
    getNotificationByStudentId,
    readNotification,
    deleteNotification
}
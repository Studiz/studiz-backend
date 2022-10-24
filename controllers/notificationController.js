'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');

const addNotification = async (req, res, next) => {
    try {
        const notification = req.body
        await firestore.collection('notifications').add(notification);
        res.status(200).send(notification);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getNotificationById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const notification = await firestore.collection('notifications').doc(id);
        const data = await notification.get();

        if (!data.exists) {
            res.status(404).send('notification with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addNotification,
    getNotificationById,
}
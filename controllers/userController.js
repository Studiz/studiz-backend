'use strict';

const firebase = require('../db');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const admin = require('../config/firebase-config');
const firestore = firebase.firestore();

const checkDuplicateEmail = async (req, res, next) => {
    try {
        const students = await firestore.collection('students');
        const data = await students.get();

        var duplicateEmail = false
        data.forEach(doc => {
            if (doc.data().email == req.body.email) {
                duplicateEmail = true
            }
        });
        if (duplicateEmail) {
            res.status(400).send('email-already-in-use');
        } else {
            res.status(200).send('email-available');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const signInUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodeValue = await admin.auth().verifyIdToken(token);
            if (decodeValue) {
                // return decodeValue;
                const students = await firestore.collection('students');
                const teachers = await firestore.collection('teachers');
                const studentByUid = await students.where('uid', '==', decodeValue.uid).get();
                const teacherByUid = await teachers.where('uid', '==', decodeValue.uid).get();

                if (!studentByUid.empty) {
                    studentByUid.forEach(doc => {
                        return res.json({
                            id: doc.id,
                            data: doc.data()
                        });
                    });

                } else if (!teacherByUid.empty) {
                    teacherByUid.forEach(doc => {
                        return res.json({
                            id: doc.id,
                            data: doc.data()
                        });

                    });
                } else res.status(404).send("Cannot find data");
                //     console.log(decodeValue.uid);
            } else return res.json({
                message: 'Un authorize'
            });
        } catch (e) {
            res.status(401).send('Token invalid');
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}


module.exports = {
    checkDuplicateEmail,
    signInUser
}
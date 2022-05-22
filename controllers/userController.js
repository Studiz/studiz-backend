'use strict';

const firebase = require('../db');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const firestore = firebase.firestore();

const checkDuplicateEmail = async (req, res, next) => {
    try {
        const students = await firestore.collection('students');
        const data = await students.get();

        var duplicateEmail = false
        data.forEach(doc => {
            if(doc.data().email == req.body.email) {
                duplicateEmail = true
            }
        });
        if(duplicateEmail) {
            res.status(400).send('email-already-in-use');
        } else {
            res.status(200).send('email-available');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


module.exports = {
    checkDuplicateEmail
}
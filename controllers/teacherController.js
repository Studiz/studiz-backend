'use strict';

const firebase = require('../db');
const Teacher = require('../models/teacher');
const firestore = firebase.firestore();

const addTeacher = async (req, res, next) => {
    try {
        const data = req.body;
        var teacherData = {
            data,
            "classrooms" : {}
        }
        await firestore.collection('teachers').doc().set(teacherData);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}
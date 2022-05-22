'use strict';

const firebase = require('../db');
const Teacher = require('../models/teacher');
const firestore = firebase.firestore();
const middleware = require('../middleware');

const addTeacher = async (req, res, next) => {
    try {
        const data = await middleware.decodeToken(req, res, next);
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

const getTeacherById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const student = await firestore.collection('teachers').doc(id);
        const data = await student.get();
        if(!data.exists) {
            res.status(404).send('Teacher with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addTeacher,
    getTeacherById
}
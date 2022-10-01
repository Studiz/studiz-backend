'use strict';

const firebase = require('../db');
const Teacher = require('../models/teacher');
const firestore = firebase.firestore();
const middleware = require('../middleware');
const jwtDecode = require('jwt-decode');

const signUpTeacherWithEmail = async (req, res, next) => {
    try {
        var decodeToken = jwtDecode(req.headers.token);
        var teacherData = {
            "email": decodeToken.email,
            "firstName": decodeToken.fname,
            "lastName": decodeToken.lname,
            "displayName": "",
            "imageUrl": "",
            "classrooms": [],
            "role": "TEACHER",
            "uid": ""
        }
        firebase.auth().createUserWithEmailAndPassword(decodeToken.email, decodeToken.password)
            .then(response => {
                let accessToken = response.user.b.b.g
                teacherData.uid = response.user.uid
                firestore.collection('teachers').doc().set(teacherData);
                res.send(accessToken);
            })
            .catch(error => {
                res.send(error)
            });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const signUpTeacherWithGoogle = async (req, res, next) => {
    try {
        var decodeToken = jwtDecode(req.headers.token);
        var teacherData = {
            "email": decodeToken.email,
            "firstName": decodeToken.fname,
            "lastName": decodeToken.lname,
            "displayName": "",
            "imageUrl": decodeToken.imageUrl,
            "classrooms": [],
            "role": "TEACHER", 
            "uid": decodeToken.uid
        }
        firestore.collection('teachers').doc().set(teacherData);
        res.send(teacherData)
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const getTeacherById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const teacher = await firestore.collection('teachers').doc(id);
        const data = await teacher.get();
        if(!data.exists) {
            res.status(404).send('Teacher with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const updateTeacher = async (req, res, next) => {
    try {
        const id = req.params.id;
        const body = req.body;
        const teacher = await firestore.collection('teachers').doc(id);
        await teacher.update(body);

        const getTeacher = await teacher.get();
        const dataTeacher = getTeacher.data()
        const classrooms = dataTeacher.classrooms

        for (let i = 0; i < classrooms.length; i++) {
            var classroomid = classrooms[i].id
            const classroom = await firestore.collection('classrooms').doc(classroomid);
            const getClassroom = await classroom.get()
            const classroomData = getClassroom.data()
            const teacherInclass = classroomData.teacher
            // studentInclass.forEach(data => {
            //     if (data.id == id) {
                teacherInclass.displayName = body.displayName
                teacherInclass.email = body.email
                teacherInclass.firstName = body.firstName
                teacherInclass.imageUrl = body.imageUrl
                teacherInclass.lastName = body.lastName
                teacherInclass.uid = body.uid
            //     }
            // })
            await classroom.update(classroomData);
        }

        res.send(dataTeacher)
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    signUpTeacherWithGoogle,
    signUpTeacherWithEmail,
    getTeacherById,
    updateTeacher
}
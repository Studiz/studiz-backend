'use strict';

const firebase = require('../db');
const Student = require('../models/student');
// const express = require('express');
// const cors = require('cors');
const middleware = require('../middleware');
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');

const signUpStudenWithEmail = async (req, res, next) => {
    try {
        var decodeToken = jwtDecode(req.headers.token);
        var studentData = {
            "email": decodeToken.email,
            "firstName": decodeToken.fname,
            "lastName": decodeToken.lname,
            "displayName": "",
            "imageUrl": "",
            "classrooms": {},
            "role": "STUDENT",
            "uid": ""
        }
        firebase.auth().createUserWithEmailAndPassword(decodeToken.email, decodeToken.password)
            .then(res => {
                studentData.uid = res.user.uid
                firestore.collection('students').doc().set(studentData);
                res.send('Record saved successfuly')
            })
            .catch(error => {
                res.send(error)
            });

        // console.log(await getAllStudents())
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const signUpStudenWithGoogle = async (req, res, next) => {
    try {
        var decodeToken = jwtDecode(req.headers.token);
        var studentData = {
            "email": decodeToken.email,
            "firstName": decodeToken.fname,
            "lastName": decodeToken.lname,
            "displayName": "",
            "imageUrl": decodeToken.imageUrl,
            "classrooms": {},
            "role": "STUDENT",
            "uid": decodeToken.uid
        }
        firestore.collection('students').doc().set(studentData);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllStudents = async (req, res, next) => {
    try {
        const students = await firestore.collection('students');
        const data = await students.get();
        const studentsArray = [];
        if (data.empty) {
            res.status(404).send('No student record found');
        } else {
            data.forEach(doc => {
                const student = new Student(
                    doc.id,
                    doc.data().firstName,
                    doc.data().lastName,
                    doc.data().userName,
                    doc.data().class,
                    doc.data().age,
                    doc.data().displayName,
                    doc.data().role,
                );
                studentsArray.push(student);
            });
            res.send(studentsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}



const getStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const student = await firestore.collection('students').doc(id);
        const data = await student.get();
        if (!data.exists) {
            res.status(404).send('Student with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const student = await firestore.collection('students').doc(id);
        await student.update(data);
        res.send('Student record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('students').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}



module.exports = {
    signUpStudenWithEmail,
    signUpStudenWithGoogle,
    getAllStudents,
    getStudent,
    updateStudent,
    deleteStudent
}
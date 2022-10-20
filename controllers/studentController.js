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
            "displayName": decodeToken.fname,
            "imageUrl": "",
            "classrooms": [],
            "role": "STUDENT",
            "uid": ""
        }
        firebase.auth().createUserWithEmailAndPassword(decodeToken.email, decodeToken.password)
            .then(response => {
                let accessToken = response.user.b.b.g
                studentData.uid = response.user.uid
                firestore.collection('students').doc().set(studentData);
                res.send(accessToken);
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
            "displayName": decodeToken.fname,
            "imageUrl": decodeToken.imageUrl,
            "classrooms": [],
            "role": "STUDENT",
            "uid": decodeToken.uid
        }
        firestore.collection('students').doc().set(studentData);
        res.send(studentData)
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
        const body = req.body;
        const student = await firestore.collection('students').doc(id);
        await student.update(body);

        const getStudent = await student.get();
        const dataStudent = getStudent.data()
        const classrooms = dataStudent.classrooms

        for (let i = 0; i < classrooms.length; i++) {
            var classroomid = classrooms[i].id
            const classroom = await firestore.collection('classrooms').doc(classroomid);
            const getClassroom = await classroom.get()
            const classroomData = getClassroom.data()
            const studentInclass = classroomData.students
            studentInclass.forEach(data => {
                if (data.id == id) {
                    data.displayName = body.displayName
                    data.email = body.email
                    data.firstName = body.firstName
                    data.imageUrl = body.imageUrl
                    data.lastName = body.lastName
                    data.uid = body.uid
                }
            })
            await classroom.update(classroomData);
        }

        res.send(dataStudent)
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

const buyItem = async (req, res, next) => {
    try {
        const studentId = req.body.studentId;
        const itemId = req.body.itemId;
        const totalItem = req.body.totalItem
        const student = await firestore.collection('students').doc(studentId);
        const item = await firestore.collection('items').doc(itemId);
        const getStudent = await student.get();
        const dataStudent = getStudent.data();
        const getItem = await item.get();
        var dataItem = getItem.data();
        if (!dataStudent) {
            return res.status(400).json({
                "errText": "Student id invalid",
                "errCode": 400
            })
        } else if (!dataItem) {
            return res.status(400).json({
                "errText": "Item id invalid",
                "errCode": 400
            })
        }

        var studentItems = dataStudent.items
        dataItem.id = itemId

        if (studentItems) {
            var isDupplicate = false
            studentItems.forEach(data => {
                if (data.id === itemId) {
                    data.total = data.total + totalItem
                    isDupplicate = true
                }
            })
            if (isDupplicate === false) {
                dataItem.total = totalItem
                studentItems.push(dataItem)
            }
            await student.update(dataStudent)

        } else {
            dataItem.total = totalItem
            dataStudent.items = [dataItem]
            await student.update(dataStudent)
        }
        res.status(200).send("Student buy item success");
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
    deleteStudent,
    buyItem
}
'use strict';

const firebase = require('../db');
const Classroom = require('../models/classroom');
const firestore = firebase.firestore();

const addClassroom = async (req, res, next) => {
    try {
        const data = req.body;
        const teacherById = await firestore.collection('teachers').doc(data.teacherId);
        const dataTeacherById = await teacherById.get();
        var dataTeacher = dataTeacherById.data()
        if(dataTeacher.role == "TEACHER"){
        var classroomData = {
            "displayName" : !data.displayName ? null : data.displayName,
            "teacher" : dataTeacher,
            "students" : {}
        }
        await firestore.collection('classrooms').doc().set(classroomData);
        res.send('Record saved successfuly');
    }else res.send('Only teacher can create classroom');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const generatePinCode = async (req, res, next) => {
    try {
        const id = req.params.classroomId;
        const allClassroom = firestore.collection('classrooms');
        var pinCode = Math.floor(100000 + Math.random() * 900000)
        const classroomById = await allClassroom.doc(id)
        var data = {'pinCode': pinCode}
        await classroomById.update(data);
        console.log(pinCode);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const deletePinCode = async (req, res, next) => {
    try {
        const id = req.params.classroomId;
        const allClassroom = firestore.collection('classrooms');
        const classroomById = await allClassroom.doc(id)
        var getClass = await classroomById.get()
        var classroom = getClass.data()
        delete classroom['pinCode'];
        console.log(classroom);
        await classroomById.set(classroom);
        res.send('PinCode deleted!');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getClassroomByPinCode = async (req, res, next) => {
    try {
        const classroom = firestore.collection('classrooms');
        const snapshot = await classroom.where('pinCode', '==', req.params.pinCode).get();
        if (snapshot.empty) {
            res.status(404).send('Classroom with the given pinCode not found');
        } else {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                res.send(doc.data());
            });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const joinClassroom = async (req, res, next) => {
    try {
        const allClassroom = firestore.collection('classrooms');
        const snapshot = await allClassroom.where('pinCode', '==', req.params.pinCode).get();
        var classIdFromPinCode
        var classroomData
        if (snapshot.empty) {
            res.status(404).send('Classroom with the given pinCode not found');
        } else {
            snapshot.forEach(doc => {
                // console.log(doc.id, '=>', doc.data());
                classIdFromPinCode = doc.id
                classroomData = doc.data()
            });
            const id = req.params.studentId;
            const classroomById = await allClassroom.doc(classIdFromPinCode)
            var getClass = await classroomById.get()
            var classroom = getClass.data()
            var size = Object.keys(classroom.students).length + 1;
            const studentById = await firestore.collection('students').doc(id);
            const dataStudentById = await studentById.get();
            var dataStudent = dataStudentById.data()
            console.log(dataStudent);
            dataStudent.classrooms[classIdFromPinCode] =   {
                "id" : classIdFromPinCode,
                "name" : classroom.name,
                "description" : classroom.description
            }
            classroom.students[id] = {
                "id": id,
                // "firstName" : dataStudent.firstName,
                // "lastName" : dataStudent.lastName,
                // "age" : dataStudent.age,
                "displayName" : dataStudent.displayName,
                "userName" : dataStudent.userName
            }
            await studentById.update(dataStudent)
            await classroomById.update(classroom);
            res.send('Student record updated successfuly');
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const leftClassroom = async (req, res, next) => {
    try {
        const allClassroom = firestore.collection('classrooms');
        const id = req.params.classroomId;
        const studentId = req.params.studentId;
        const classroomById = await allClassroom.doc(id)
        var getClass = await classroomById.get()
        var classroom = getClass.data()
        delete classroom.students[studentId];
        // classroom.students[studentId] = null;
        await classroomById.set(classroom);
        res.send('Student left classroom successfuly');


    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteClassroom = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('classrooms').doc(id).delete();
        res.send('Classroom record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addClassroom,
    getClassroomByPinCode,
    joinClassroom,
    leftClassroom,
    generatePinCode,
    deletePinCode,
    deleteClassroom
}
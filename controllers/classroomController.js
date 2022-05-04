'use strict';

const firebase = require('../db');
const Classroom = require('../models/classroom');
const firestore = firebase.firestore();

const addClassroom = async (req, res, next) => {
    try {
        const data = req.body;
        const classroom = {
            "name": data.name,
            "pinCode": data.pinCode
        }
        await firestore.collection('classrooms').doc().set(classroom);
        res.send('Record saved successfuly');
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
        const classroom = firestore.collection('classrooms');
        const snapshot = await classroom.where('pinCode', '==', req.params.pinCode).get();
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
            const classroomById = await classroom.doc(classIdFromPinCode)
            const student = await firestore.collection('students').doc(id);
            const dataStudentx = await student.get();
            const dataStudent = dataStudentx.data()
            // const allStudentInClass = !classroomData.students ? "" : classroomData.students
            // console.log(allStudentInClass)
            //   var std = {classroomData.students,dataStudentx}
            //    let y = allStudentInClass.push(id)
            // const std = {
            //     "students": {
            //         "1": {
            //             "id": id,
            //             "firstName": dataStudent.firstName
            //         }
            //     }
            // }
            let body = req.body
            console.log(allStudentInClass)
            await classroomById.update(body);
            res.send('Student record updated successfuly');
        }
     
    


} catch (error) {
    res.status(400).send(error.message);
}
}

module.exports = {
    addClassroom,
    getClassroomByPinCode,
    joinClassroom
}
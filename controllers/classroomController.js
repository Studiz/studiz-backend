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
            classroom.students[id] = {
                "id": id,
                "firstName": dataStudent.age
            };
            console.log(size);
            //   var body = {'0' : { 'id' :'dadadawdawda'}}
            //  var z = classroom.students[body]
            //  var y = Object.assign(body,classroom.students)
            // var x = classroom.students.push({'0' : { 'id' :'dadadawdawda'}} )
            //  console.log(y);
            // const studentById = await firestore.collection('students').doc(id);
            // const dataStudentById = await studentById.get();
            // console.log(dataStudentById)
            // const dataStudent = dataStudentById.data()
            // console.log(dataStudent)
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
            // let body = req.body
            // console.log(allStudentInClass)
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
        // classroom.students[studentId] = null
        // const res = await classroomById.update({
        //     students: FieldValue.delete()
        // });
        // var jobskill_query = firestore.collection('classrooms').where('name', '==', 'Math');
        // jobskill_query.get().then(function (querySnapshot) {
        //     querySnapshot.forEach(function (doc) {
        //         doc.ref.delete();
        //     });
        // });
        classroom.students[studentId] = null;
        await classroomById.update(classroom);
        res.send('Student left classroom successfuly');

    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addClassroom,
    getClassroomByPinCode,
    joinClassroom,
    leftClassroom
}
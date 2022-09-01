'use strict';

const firebase = require('../db');
const Classroom = require('../models/classroom');
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');
const middleware = require('../middleware');

const createClassroom = async (req, res, next) => {
    try {
        const data = req.body;
        const teacherById = await firestore.collection('teachers').doc(data.teacherId);
        const dataTeacherById = await teacherById.get();
        var dataTeacher = dataTeacherById.data()
        var classrooms = dataTeacherById.data().classrooms
        delete dataTeacher.classrooms
        var id;
        if (dataTeacher.role == "TEACHER") {
            var classroomData = {
                "color": data.color,
                "name": data.name,
                "teacher": dataTeacher,
                "description": data.description,
                "relevantSubjects": data.relevantSubjects,
                "students": []
            }
            // await firestore.collection('classrooms').doc().set(classroomData)
            await firestore.collection('classrooms').add(classroomData).then((res) => {
                classroomData.id = res.id
                id = res.id
                delete classroomData.students
                delete classroomData.teacher
                console.log(classrooms);
                teacherById.set({
                    classrooms: [...classrooms, classroomData],
                }, {
                    merge: true
                })
            })
            // console.log(id);
            res.status(200).json({
                "id": id
            });
        } else res.send('Only teacher can create classroom');
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
        var data = {
            'pinCode': pinCode
        }
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

const getStudentByClassroomId = async (req, res, next) => {
    try {
        const id = req.params.classroomId;
        const allClassroom = firestore.collection('classrooms');
        const classroomById = await allClassroom.doc(id)
        const getClass = await classroomById.get()
        const classroom = getClass.data()
        if (!id) {
            res.status(404).send('ClassroomId not found');
        }
        if (!classroom) {
            res.status(404).send('Classroom not found');
        } else {
            res.send(classroom.students);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const joinClassroom = async (req, res, next) => {
    try {
        const id = req.params.studentId;
        const allClassroom = firestore.collection('classrooms');
        console.log(req.params.pinCode);
        const snapshot = await allClassroom.where('pinCode', '==', Number(req.params.pinCode)).get();

        // console.log(snapshot);
        var classIdFromPinCode
        var classroomData
        if (snapshot.empty) {
            res.status(404).send('Classroom with the given pinCode not found');
        } else {
            snapshot.forEach(doc => {
                classIdFromPinCode = doc.id
            });


            // const id = req.params.studentId;
            const classroomById = await allClassroom.doc(classIdFromPinCode)
            var getClass = await classroomById.get()
            var classroom = getClass.data()
            // var size = Object.keys(classroom.students).length + 1;
            const studentById = await firestore.collection('students').doc(id);
            const dataStudentById = await studentById.get();
            var dataStudent = dataStudentById.data()
            if (!checkDupplicateStudent(classroom.students, id)) {
                // console.log(classroom);
                var json1 = {
                    "id": classIdFromPinCode,
                    "name": classroom.name,
                    "description": classroom.description,
                    "color": classroom.color,
                    "teacher": {
                        "firstName": classroom.teacher.firstName,
                        "lastName": classroom.teacher.lastName,
                        "email": classroom.teacher.email,
                        "imageUrl": classroom.teacher.imageUrl,
                        "displayName": classroom.teacher.displayName
                    }
                }
                var json2 = {
                    "id": id,
                    "firstName": dataStudent.firstName,
                    "lastName": dataStudent.lastName,
                    "displayName": dataStudent.displayName,
                    "email": dataStudent.email,
                    "uid": dataStudent.uid,
                    "imageUrl": dataStudent.imageUrl
                }
                classroomById.set({
                    students: [...classroom.students, json2],
                }, {
                    merge: true
                })

                studentById.set({
                    classrooms: [...dataStudent.classrooms, json1],
                }, {
                    merge: true
                })
                // await studentById.update(dataStudent)
                // await classroomById.update(classroom);
                res.send('Student record updated successfuly');
            } else res.send('Student is alrady in classroom');
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
        // delete classroom.students[studentId];
        // await classroomById.set(classroom);
        classroomById.set({
            students: [...classroom.students.filter(student => student.id !== studentId)],
        }, {
            merge: true
        })

        // Delete classrooms in user profile
        const studentById = await firestore.collection('students').doc(studentId);
        const dataStudentById = await studentById.get();
        var dataStudent = dataStudentById.data()
        studentById.set({
            classrooms: [...dataStudent.classrooms.filter(classroom => classroom.id !== id)],
        }, {
            merge: true
        })

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

const updateClassroom = async (req, res, next) => {
    try {
        const id = req.params.id;
        const body = req.body;
        const classroom = await firestore.collection('classrooms').doc(id);
        await classroom.update(body);

        const getClassroom = await classroom.get();
        const dataClassroom = getClassroom.data()
        const students = dataClassroom.students

        for (let i = 0; i < students.length; i++) {
            var studentId = students[i].id
            const student = await firestore.collection('students').doc(studentId);
            const getStudent = await student.get()
            const studentData = getStudent.data()
            const classroomInstd = studentData.classrooms
            classroomInstd.forEach(data => {
                if (data.id == id) {
                    data.id = id,
                        data.name = body.name,
                        data.description = body.description,
                        data.color = body.color
                }
            })
            await student.update(studentData);
        }

        res.send(dataClassroom)
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getClassroomById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const classroom = await firestore.collection('classrooms').doc(id);
        const data = await classroom.get();
        if (!data.exists) {
            res.status(404).send('Classroom with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

function checkDupplicateStudent(students, id) {
    var isDupplicate = false
    students.forEach(data => {
        if (data.id == id) {
            isDupplicate = true;
        }
    })
    return isDupplicate
}

const kickStudntInClassroom = async (req, res, next) => {
    try {
        var decodeToken = jwtDecode(req.headers.token);
        if (decodeToken.role === "TEACHER") {
            const allClassroom = firestore.collection('classrooms');
            const id = req.params.classroomId;
            const studentId = req.params.studentId;
            const classroomById = await allClassroom.doc(id)
            var getClass = await classroomById.get()
            var classroom = getClass.data()
            // delete classroom.students[studentId];
            // await classroomById.set(classroom);
            classroomById.set({
                students: [...classroom.students.filter(student => student.id !== studentId)],
            }, {
                merge: true
            })

            // Delete classrooms in user profile
            const studentById = await firestore.collection('students').doc(studentId);
            const dataStudentById = await studentById.get();
            var dataStudent = dataStudentById.data()
            studentById.set({
                classrooms: [...dataStudent.classrooms.filter(classroom => classroom.id !== id)],
            }, {
                merge: true
            })

            res.send('Student left classroom successfuly');
        } else {
            res.send('Token invalid')
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const addHistoryQuizInClassroom = async (req, res, next) => {
    try {
        const allClassroom = firestore.collection('classrooms');
    }catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    createClassroom,
    getClassroomByPinCode,
    joinClassroom,
    leftClassroom,
    generatePinCode,
    deletePinCode,
    deleteClassroom,
    getStudentByClassroomId,
    updateClassroom,
    getClassroomById,
    kickStudntInClassroom
}
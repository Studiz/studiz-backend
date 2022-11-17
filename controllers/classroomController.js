'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');
const middleware = require('../middleware');

const createClassroom = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }
        const data = req.body;
        const teacherById = await firestore.collection('teachers').doc(data.teacherId);
        const dataTeacherById = await teacherById.get();
        var dataTeacher = dataTeacherById.data()
        dataTeacher.id = data.teacherId
        console.log(dataTeacher);
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
        if (!classroom) {
            return res.status(400).json({
                "errText": "Classroom id invalid",
                "errCode": 400
            })
        }
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
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }
        const uid = decodeToken.user_id
        const id = req.params.studentId;
        const allClassroom = firestore.collection('classrooms');
        console.log(req.params.pinCode);
        const snapshot = await allClassroom.where('pinCode', '==', Number(req.params.pinCode)).get();
        const students = await firestore.collection("students");
        const getStudent = await students.get();
        const studentArray = [];
        // console.log(snapshot.data());
        // console.log(snapshot);
        var classIdFromPinCode
        var classroomData
        if (snapshot.empty) {
            res.status(404).send('Classroom with the given pinCode not found');
        } else {
            snapshot.forEach(doc => {
                classIdFromPinCode = doc.id
            });
            getStudent.forEach((doc) => {
                const docData = doc.data();
                docData.id = doc.id
                studentArray.push(docData);
            });
            const filterData = studentArray.filter((student) => {
                return uid.includes(student.uid)
            })
            const classroomInstudent = filterData[0].classrooms
            // console.log(classroomInstudent);
            // console.log(filterClassroom);
            const filterClassroom = classroomInstudent.filter((classroom) => {
                return classIdFromPinCode.includes(classroom.id)
            })
              console.log(filterClassroom);
            if(filterClassroom.length === 0) {

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
            }else res.send('Student is already in classroom');
            } else res.send('Student is already in classroom');
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
        const classroom = await firestore.collection('classrooms').doc(id);
        const getClassroom = await classroom.get();
        const classroomData = getClassroom.data();
        const teacherInclass = classroomData.teacher
        const teacher = await firestore.collection('teachers').doc(teacherInclass.id);
        const getTeacher = await teacher.get();
        const teacherData = getTeacher.data();
        const teacherClassroom = teacherData.classrooms;

        teacherClassroom.splice(teacherClassroom.findIndex(data => data.id === id), 1);
        await teacher.update(teacherData)

        const students = classroomData.students
        // console.log(classroomData);
        students.forEach(async doc => {
            const student = await firestore.collection('students').doc(doc.id);
            const getStudent = await student.get();
            const studentData = getStudent.data();
            const studentClassroom = studentData.classrooms;
            // console.log(studentData);

            studentClassroom.splice(studentClassroom.findIndex(data => data.id === id), 1);
            await student.update(studentData)
        });

        classroom.delete()
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

        const teacher = await firestore.collection('teachers').doc(dataClassroom.teacher.id);
        const getTeacher = await teacher.get()
        const teacherData = getTeacher.data()
        const classroomInstd = teacherData.classrooms
        classroomInstd.forEach(data => {
            if (data.id == id) {
                data.id = id,
                    data.name = body.name,
                    data.description = body.description,
                    data.color = body.color,
                    data.relevantSubjects = body.relevantSubjects
            }
        })
        await teacher.update(teacherData);

        res.send(dataClassroom)
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getClassroomById = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }
        const uid = decodeToken.user_id
        const id = req.params.id;
        const classroom = await firestore.collection('classrooms').doc(id);
        const data = await classroom.get();
        // console.log(decodeToken); 
        const students = await firestore.collection("students");
        const getStudent = await students.get();
        const studentArray = [];
        getStudent.forEach((doc) => {
                const docData = doc.data();
                docData.id = doc.id
                studentArray.push(docData);
            });
        
        const filterData = studentArray.filter((student) => {
            return uid.includes(student.uid)
        })
        // console.log(filterData);
        const classroomInstudent = filterData[0].classrooms
        // console.log(filterClassroom);
        const filterClassroom = classroomInstudent?.filter((classroom) => {
            return id.includes(classroom.id)
        })
        console.log(filterClassroom);
        if(filterClassroom.length === 0) {
            res.status(406).send("You don't have permission to see this classroom");
           
        }else  res.status(200).send(data.data());
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

        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }
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

const kickAllStudntInClassroom = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                "errCode": 401,
                "errText": "Unauthorized"
            });
        }
        const allClassroom = firestore.collection('classrooms');
        const id = req.params.classroomId;
        const classroomById = await allClassroom.doc(id)
        var getClass = await classroomById.get()
        var classroom = getClass.data()
        const students = classroom.students

        // Delete classrooms in user profile
        students.forEach(async doc => {
            const student = await firestore.collection('students').doc(doc.id);
            const getStudent = await student.get();
            const studentData = getStudent.data();
            const studentClassroom = studentData.classrooms;

            studentClassroom.splice(studentClassroom.findIndex(data => data.id === id), 1);
            // console.log(studentData);
            await student.update(studentData)
        });
        classroom.students = [];

        await classroomById.update(classroom);

        res.send('All Student left classroom successfuly');

    } catch (error) {
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
    kickStudntInClassroom,
    kickAllStudntInClassroom
}
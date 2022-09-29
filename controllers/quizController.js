'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
var nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const {
    Socket
} = require('socket.io');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    service: 'gmail',
    secure: false,
    auth: {
        user: 'studiz.games@gmail.com',
        pass: 'eezzdeszuplzhseg'
    }
});


const createQuiz = async (req, res, next) => {

    try {
        const data = req.body

        var pinCode = Math.floor(100000 + Math.random() * 900000)
        const quizeTemplates = await firestore.collection('quizTemplates').doc(data.quizTemplateId);
        const quizeTemplatesData = await quizeTemplates.get();


        // var quizData = {
        //     data,
        //     url: makeid(10),
        //     pinCode: pinCode,
        //     quizeTemplatesData
        // }

        let quizData = {
            teacherId: data.teacherId,
            pinCode: pinCode,
            quizTemplate: quizeTemplatesData.data(),
            studentList: data.studentList,
            isLive: true
        }

        let quiz = await firestore.collection('quizes').add(quizData);
        quizData.id = await quiz.id
        if (data.classroomId) {
            var classroomId = data.classroomId
            console.log(classroomId);
            const classroom = await firestore.collection('classrooms').doc(classroomId);
            const getClass = await classroom.get();
            const classroomData = getClass.data();
            // console.log(classroomData);
            const studentInClass = classroomData.students
            studentInClass.forEach(doc => {

                var mailOptions = {
                    from: 'studiz.games@gmail.com',
                    to: `${doc.email}`,
                    subject: 'Sending Email using Node.js',
                    text: 'That was easy!'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            });
        }
        res.send(quizData);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateQuiz = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const quiz = await firestore.collection('quizes').doc(id);
        await quiz.update(data);
        res.send('quiz record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteQuiz = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('quizes').doc(id).delete();
        res.send('quiz record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQuizById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await firestore.collection('quizes').doc(id);
        const data = await quiz.get();
        // var mailOptions = {
        //     from: 'studiz.games@gmail.com',
        //     to: 'apisit.top@mail.kmutt.ac.th',
        //     subject: 'Sending Email using Node.js',
        //     text: 'That was easy!'
        // };
        // transporter.sendMail(mailOptions, function (error, info) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //     }
        // });

        // const msg = {
        //     to: 'apisit7985@gmail.com',
        //     from: 'traitawat.25957@mail.kmutt.ac.th',
        //     templateId: 'd-a497b6ba8e0945599acf546010466e00',
        //     dynamicTemplateData: {

        //     },
        //   };
        //   sgMail.send(msg);

        if (!data.exists) {
            res.status(404).send('quiz with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQuizByIdForStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await firestore.collection('quizes').doc(id);
        const data = await quiz.get();
        if (!data.exists) {
            res.status(404).send('quiz with the given ID not found');
        } else {
            let dataForStudent = data.data()
            delete dataForStudent.quizTemplate.questions
            res.send(dataForStudent);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


// function makeid(length) {
//     var result = '';
//     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for (var i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() *
//             charactersLength));
//     }
//     return result;
// }

const joinQuiz = async (req, res, next) => {
    let quiz
    try {
        const pinCode = req.params.pinCode;
        const studentId = req.body.studentId;

        const allQuiz = firestore.collection('quizes');
        const snapshot = await allQuiz.where('pinCode', '==', Number(req.params.pinCode)).get();

        let quizIdFromPinCode
        if (snapshot.empty) {
            res.status(404).send('Quiz with the given pinCode not found');
        } else {
            snapshot.forEach(doc => {
                quizIdFromPinCode = doc.id
            });
            const quizById = await allQuiz.doc(quizIdFromPinCode)
            let getQuiz = await quizById.get()
            quiz = getQuiz.data()

            res.status(200).json({
                "quizId": quizIdFromPinCode,
                "quizDetails": quiz
            });

        }


        // ทำควบคู่กับ Socket ดูทรงไม่น่าใช้
        // let quizIdFromPinCode
        // if (snapshot.empty) {
        //     res.status(404).send('Quiz with the given pinCode not found');
        // } else {
        //     snapshot.forEach(doc => {
        //         quizIdFromPinCode = doc.id
        //     });
        //     const quizById = await allQuiz.doc(quizIdFromPinCode)
        //     let getQuiz = await quizById.get()
        //     quiz = getQuiz.data()

        //     // find student data
        //     const studentById = await firestore.collection('students').doc(studentId);
        //     const getStudent = await studentById.get();
        //     let dataStudent = getStudent.data()
        //     delete dataStudent.classrooms

        //     let isJoined = quiz.studentList.some(student => {
        //         return student.uid === dataStudent.uid
        //     })
        //     // fortest
        //     if (true) {
        //         // if (!isJoined) {
        //         quiz.studentList.push(dataStudent)
        //         quizById.set(quiz)

        //         delete quiz.quizTemplate.questions
        //         res.status(200).json({
        //             "quizId": quizIdFromPinCode,
        //             "quizDetails": quiz
        //         });
        //     } else {
        //         res.status(400).send('student already joined');
        //     }

        // }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


module.exports = {
    deleteQuiz,
    updateQuiz,
    createQuiz,
    getQuizById,
    joinQuiz,
    getQuizByIdForStudent
}
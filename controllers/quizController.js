'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
 port: 587,
 secure: false,
    auth: {
      user: 'studiz.games@gmail.com',
      pass: 'zpmofowhghponmai'
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
            studentResultList: data.studentResultList,
        }

        await firestore.collection('quizes').add(quizData);
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
        var mailOptions = {
            from: '"Fred Foo 👻" <studiz.games@gmail.com>',
            to: 'actlook55@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
      
   

        if (!data.exists) {
            res.status(404).send('quiz with the given ID not found');
        } else {
            res.send(data.data());
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

const addStudentToQuiz = async (req, res, next) => {
    let quiz
    try {
        const quizId = req.params.quizId;
        const studentId = req.body.studentId;
        quiz = await firestore.collection('quizes').doc(quizId);
        const getQuiz = await quiz.get();
        let quizData = getQuiz.data();
        quizData.studentList.push(studentId)
        console.log(quizData);
        await quiz.set(quizData)
        res.send('student added to quiz');
    } catch (error) {
        res.status(400).send(error.message);
    }
}


module.exports = {
    deleteQuiz,
    updateQuiz,
    createQuiz,
    getQuizById,
    addStudentToQuiz
}
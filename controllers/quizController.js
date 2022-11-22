"use strict";

const firebase = require("../db");
const firestore = firebase.firestore();
var nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const { Socket } = require("socket.io");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwtDecode = require("jwt-decode");
const dayjs = require("dayjs");

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    service: "gmail",
    secure: false,
    auth: {
        user: process.env.STUDIZ_EMAIL,
        pass: process.env.STUDIZ_PASSWORD,
    },
});

const createQuiz = async (req, res, next) => {
    try {
        try {
            var decodeToken = jwtDecode(req.headers.token);
        } catch (error) {
            return res.status(401).json({
                errCode: 401,
                errText: "Unauthorized",
            });
        }
        const data = req.body;

        var pinCode = Math.floor(100000 + Math.random() * 900000);
        const quizeTemplates = await firestore.collection("quizTemplates").doc(data.quizTemplateId);
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
            classroomId: data.classroomId,
            isLive: false,
            isEnded: false,
            startAt: data.startAt,
        };

        quizData.quizTemplate.totalQuestion = quizData.quizTemplate.questions.length;

        let quiz = await firestore.collection("quizes").add(quizData);
        quizData.id = await quiz.id;
        if (data.classroomId) {
            var classroomId = data.classroomId;
            const classroom = await firestore.collection("classrooms").doc(classroomId);
            const getClass = await classroom.get();
            const classroomData = getClass.data();
            const studentInClass = classroomData.students;
            studentInClass.forEach((doc) => {
                var mailOptions = {
                    from: process.env.STUDIZ_EMAIL,
                    to: `${doc.email}`,
                    subject: "The quiz has start",
                    text: "Let login and play!",
                    html: `<html lang="en-US"> <head> <meta content="text/html; charset=utf-8" http-equiv="Content-Type" /> <title>Studiz mail</title> <meta name="description" content="New studiz mail."> <script src="https://cdn.tailwindcss.com"></script> <style type="text/css"> a:hover { text-decoration: underline !important; } .logo-studiz { background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 173 95.99'%3E%3Cdefs%3E%3Cstyle%3E.d%7Bfill:%2322a1ee;%7D.e%7Bfill:%23ff6b35;%7D%3C/style%3E%3C/defs%3E%3Cg id='a'/%3E%3Cg id='b'%3E%3Cg id='c'%3E%3Cpath class='d' d='M32.37,60.63c2.2,0,3.78-.4,4.74-1.19,.96-.79,1.44-1.74,1.44-2.84,0-1.02-.38-1.85-1.13-2.48-.75-.63-1.87-1.17-3.34-1.62l-3.25-1.04c-2.2-.73-4.14-1.55-5.84-2.44-1.69-.9-3-2.05-3.92-3.49-.92-1.42-1.37-3.24-1.37-5.43,0-3.38,1.28-6.06,3.85-8.07,2.57-2,6.14-2.99,10.71-2.99,2.33,0,4.39,.23,6.21,.67,1.82,.45,3.24,1.11,4.28,1.99,1.04,.88,1.56,1.95,1.56,3.21,0,.94-.22,1.74-.64,2.41-.42,.67-.97,1.25-1.62,1.74-.94-.65-2.18-1.21-3.73-1.68-1.55-.46-3.27-.7-5.14-.7s-3.42,.32-4.4,.95c-.98,.63-1.47,1.45-1.47,2.48,0,.82,.33,1.48,.98,1.99,.65,.51,1.63,.97,2.94,1.37l3.37,1.04c3.71,1.15,6.56,2.66,8.57,4.55,1.99,1.9,3,4.42,3,7.6,0,3.42-1.32,6.2-3.98,8.34-2.65,2.14-6.48,3.21-11.5,3.21-2.49,0-4.71-.27-6.67-.79-1.96-.52-3.51-1.3-4.68-2.32-1.16-1.02-1.75-2.2-1.75-3.55,0-1.06,.32-1.97,.95-2.72s1.33-1.31,2.11-1.68c1.11,.9,2.48,1.7,4.12,2.41,1.65,.71,3.51,1.07,5.6,1.07h0Z'/%3E%3Cpath class='d' d='M65.07,39.34l.05,5.6h-14.21c-.22-.28-.39-.66-.53-1.15-.14-.48-.21-1.01-.21-1.56,0-1.01,.22-1.75,.67-2.2,.44-.45,1.04-.69,1.77-.69h12.46Zm-6.85,4.37h7.04v23.43c-.31,.09-.77,.18-1.38,.26-.61,.08-1.24,.12-1.88,.12-1.38,0-2.35-.25-2.92-.73-.57-.49-.85-1.34-.85-2.57v-20.5Zm.37,1.24l-.05-5.6h14.21c.19,.28,.36,.66,.5,1.15,.16,.49,.23,1.01,.23,1.56,0,.98-.23,1.71-.67,2.18-.44,.47-1.05,.71-1.82,.71h-12.4Z'/%3E%3Cpath class='e' d='M84.61,55.46h-7.04v-16.22c.34-.06,.81-.14,1.42-.23,.61-.09,1.22-.14,1.84-.14,1.32,0,2.28,.23,2.87,.69,.6,.45,.9,1.33,.9,2.62v13.27h0Zm5.01,12.49c-2.52,0-4.67-.45-6.46-1.35-1.8-.91-3.17-2.16-4.13-3.79-.97-1.62-1.45-3.52-1.45-5.7v-3.03h7.04v2.84c0,1.69,.46,2.99,1.4,3.93,.94,.94,2.14,1.4,3.61,1.4s2.67-.46,3.61-1.4c.94-.94,1.4-2.24,1.4-3.93v-2.84h7.04v3.03c0,2.17-.47,4.07-1.42,5.7-.95,1.62-2.33,2.88-4.14,3.79-1.81,.9-3.97,1.35-6.48,1.35h0Zm12.05-12.4h-7.04v-16.31c.34-.06,.82-.14,1.45-.23,.62-.09,1.23-.14,1.82-.14,1.32,0,2.28,.23,2.87,.69,.6,.45,.9,1.33,.9,2.62v13.36Z'/%3E%3Cpath class='d' d='M131.53,61.33c-1.27,2.17-3.05,3.8-5.34,4.89-2.28,1.09-4.95,1.63-8.02,1.63-1.01,0-2.25-.07-3.72-.21-1.47-.14-2.8-.42-4-.85-1.6-.58-2.39-1.61-2.39-3.08v-21.95c0-.61,.17-1.08,.5-1.4,.34-.33,.78-.59,1.33-.8,1.22-.4,2.55-.66,3.96-.78,1.41-.12,2.69-.19,3.86-.19,3.16,0,5.91,.52,8.25,1.58,2.35,1.06,4.17,2.66,5.5,4.8,1.32,2.14,1.97,4.85,1.97,8.13s-.64,6.04-1.9,8.22v.02Zm-6.35-13.14c-.69-1.31-1.64-2.3-2.85-2.96-1.21-.66-2.61-.99-4.2-.99-.55,0-1.09,.02-1.59,.07s-1.02,.1-1.54,.16v17.4c.46,.09,.98,.16,1.56,.21,.58,.05,1.13,.07,1.66,.07,2.42,0,4.36-.75,5.81-2.25,1.45-1.5,2.18-3.72,2.18-6.66,0-2.05-.34-3.73-1.04-5.06h.01Z'/%3E%3Cpath class='e' d='M145.54,56.56h-6.99v-17.31c.3-.06,.77-.14,1.4-.23,.63-.09,1.25-.14,1.86-.14,1.31,0,2.27,.23,2.85,.69,.58,.45,.88,1.33,.88,2.62v14.38h-.01Zm-6.99-8.83h6.99v19.38c-.28,.09-.72,.18-1.33,.26s-1.24,.12-1.88,.12c-1.38,0-2.35-.25-2.92-.73-.57-.49-.85-1.34-.85-2.57v-16.44h0Z'/%3E%3Cpath class='e' d='M152.35,59.5l16.46-20.3h2.11c1.16,.95,1.75,2.2,1.75,3.76,0,.7-.16,1.38-.46,2.02-.31,.64-.7,1.27-1.19,1.89l-16.37,20.3h-2.49c-.46-.37-.84-.87-1.12-1.52-.29-.64-.43-1.36-.43-2.16,0-.67,.17-1.35,.5-2.04,.34-.69,.75-1.34,1.24-1.96h0Zm17.24-20.29l-2.58,5.74h-15.27c-.19-.31-.36-.7-.53-1.18-.17-.47-.26-1.01-.26-1.58,0-1.01,.23-1.76,.69-2.25,.46-.49,1.08-.73,1.88-.73h16.06Zm-16.51,27.97l3.27-5.74h15.87c.19,.31,.36,.7,.53,1.2,.17,.49,.26,1.03,.26,1.61,0,1.01-.23,1.76-.67,2.23-.44,.47-1.07,.71-1.86,.71h-17.39Z'/%3E%3Cpath class='e' d='M80.21,71.88c-.09,.12-.95,1.23-.48,.65-.31,.38-.61,.76-.93,1.13-.66,.79-1.36,1.55-2.08,2.29-1.39,1.43-2.89,2.79-4.47,4.01,.55-.42-.36,.26-.51,.37-.39,.29-.79,.56-1.19,.84-.86,.58-1.74,1.13-2.63,1.65-.85,.48-1.72,.95-2.6,1.38-.44,.22-.89,.42-1.33,.62-.23,.1-.45,.2-.67,.3,.38-.16,.19-.08-.08,.03-1.91,.74-3.86,1.38-5.85,1.87-.98,.24-1.96,.44-2.96,.61-.25,.04-.5,.08-.75,.12-.1,.02-.89,.12-.42,.06,.42-.05-.21,.02-.24,.02-.38,.04-.76,.08-1.14,.12-1.98,.18-3.98,.22-5.96,.12-.91-.04-1.82-.11-2.72-.21-.23-.02-.45-.05-.67-.08,.15,.02,.81,.12,.05,0-.5-.08-1-.16-1.49-.25-1.8-.33-3.57-.77-5.32-1.32-.78-.25-1.56-.52-2.33-.81-.16-.06-1.28-.5-.9-.35,.47,.19-.17-.07-.28-.12-.25-.11-.49-.22-.74-.34-1.62-.75-3.2-1.6-4.72-2.55-.69-.42-1.36-.87-2.02-1.33-.36-.25-.7-.5-1.05-.76-.59-.43-.08-.06,.03,.03-.22-.17-.42-.34-.63-.5-1.38-1.12-2.68-2.31-3.92-3.59-.6-.61-1.17-1.25-1.74-1.9-.28-.33-.55-.65-.83-.99-.17-.21-.87-1.13-.38-.47-2.13-2.87-3.96-5.95-5.36-9.24,.34,.79-.14-.36-.22-.57-.14-.36-.27-.72-.39-1.08-.32-.88-.59-1.78-.85-2.68-.5-1.77-.89-3.57-1.16-5.38-.02-.13-.11-.84-.05-.32,.06,.52-.02-.19-.03-.32l-.12-1.19c-.09-1.03-.14-2.05-.16-3.09-.03-1.84,.06-3.67,.26-5.5,.02-.23,.05-.45,.08-.67-.02,.15-.12,.81,0,.05,.07-.44,.14-.89,.22-1.33,.16-.88,.35-1.75,.55-2.62,.42-1.77,.97-3.51,1.61-5.2,.06-.16,.5-1.28,.35-.9-.16,.39,.32-.72,.39-.88,.38-.84,.8-1.67,1.23-2.48,.82-1.52,1.73-2.99,2.71-4.41,.25-.36,.5-.7,.76-1.05,.43-.59,.06-.08-.03,.03,.13-.17,.27-.34,.4-.5,.57-.71,1.16-1.4,1.78-2.08,1.19-1.31,2.47-2.55,3.8-3.71,.29-.25,.57-.48,.86-.73,.13-.11,1.07-.84,.74-.59-.33,.25,.63-.46,.77-.55,.39-.29,.79-.56,1.19-.83,1.48-.99,3.03-1.89,4.62-2.7,.73-.37,1.47-.71,2.21-1.04,.68-.31,.09-.04-.04,.02,.21-.08,.4-.17,.61-.25,.45-.18,.92-.36,1.38-.51,1.72-.61,3.47-1.11,5.25-1.5,.88-.19,1.76-.36,2.63-.49,.23-.04,.44-.07,.67-.1-.05,0-.68,.08-.21,.03,.5-.05,1.02-.11,1.52-.16,1.92-.17,3.86-.2,5.79-.12,.96,.04,1.92,.12,2.88,.23l.53,.06c-.76-.08-.14-.02,0,0,.58,.09,1.16,.19,1.75,.3,1.84,.35,3.65,.81,5.44,1.39,.88,.29,1.75,.6,2.61,.95,.22,.09,.42,.17,.64,.26-.15-.06-.68-.31,0,0,.47,.22,.94,.42,1.4,.65,1.7,.83,3.34,1.76,4.9,2.8,.71,.47,1.41,.96,2.09,1.47,.09,.07,.66,.5,.28,.21-.38-.3,.19,.15,.27,.22,.39,.32,.79,.65,1.17,.98,1.37,1.19,2.67,2.46,3.89,3.81,.61,.67,1.19,1.37,1.77,2.07,.47,.58,.1,.13,0,0,.14,.18,.28,.37,.4,.54,.31,.41,.6,.83,.89,1.25,1.07,1.55,2.02,3.18,2.88,4.86,.41,.82,.8,1.65,1.17,2.49-.31-.67,.11,.28,.2,.49,.19,.48,.37,.98,.54,1.46,.69,1.95,2.72,3.45,4.86,2.76,1.91-.62,3.49-2.78,2.75-4.86C87.65,16.33,73.74,3.87,56.9,.82,40.05-2.23,23.61,3.34,12.48,15.67,1.35,28.01-2.76,45.46,1.87,61.4c4.48,15.42,16.75,27.81,32.06,32.53,17.12,5.27,36.39,.2,48.74-12.78,1.57-1.65,3-3.44,4.34-5.27,1.22-1.67,.34-4.47-1.42-5.4-2.05-1.09-4.1-.37-5.4,1.42v-.02Z'/%3E%3Cpath class='e' d='M88.54,94.39c.23,.76-.48,1.47-1.24,1.24l-17.79-5.29c-.73-.22-.96-1.13-.42-1.67l12.5-12.5c.54-.54,1.45-.3,1.67,.42l5.29,17.79Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); background-position: center; background-size: 108px; background-repeat: no-repeat; } .primary-color { background-color: #22a1ee; } .bg-color { background-color: #f2f3f8; } </style> </head> <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; " leftmargin="0" class="bg-color"> <!-- 100% body table --> <table cellspacing="0" border="0" cellpadding="0" width="100%" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;" class="bg-color"> <tr> <td> <table style="max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0" class="bg-color"> <tr> <td style="height:80px;">&nbsp;</td> </tr> <tr> <td style="text-align:center;"> <a href="https://www.studiz.games/join" title="logo" target="_blank" class="inline-flex"> <div class="logo-studiz" style="height: 60px; width: 120px;"></div> </a> </td> </tr> <tr> <td style="height:20px;">&nbsp;</td> </tr> <tr> <td> <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"> <tr> <td style="height:40px;">&nbsp;</td> </tr> <tr> <td style="padding:0 35px;"> <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;"> Quiz started </h1> <p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;"> Your account has been invited to play quiz, <br><strong>Please click button below to go to the website and login to play quiz</strong>.</p> <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span> <p style="color:#455056; font-size:18px;line-height:20px; margin:0; font-weight: 500;"> <strong style="display: block;font-size: 13px; margin: 0 0 4px; color:rgba(0,0,0,.64); font-weight:normal;">Pincode</strong>${pinCode} </p> <a href="https://www.studiz.games/login" style="text-decoration:none !important; display:inline-block; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;" class="primary-color">Login to your Account</a> </td> </tr> <tr> <td style="height:40px;">&nbsp;</td> </tr> </table> </td> </tr> <tr> <td style="height:20px;" class="insert-space">&nbsp;</td> </tr> <tr> <td style="text-align:center;"> <p style="font-size:14px; line-height:18px; margin:0 0 0;" class="text-[#455056]/70"> &copy; <strong>https://www.studiz.games</strong> </p> </td> </tr> <tr> <td style="height:80px;">&nbsp;</td> </tr> </table> </td> </tr> </table> <!--/100% body table--> </body> </html>`,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                });
            });
        }
        res.send(quizData);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const updateQuiz = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const quiz = await firestore.collection("quizes").doc(id);
        await quiz.update(data);
        res.send("quiz record updated successfuly");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteQuiz = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection("quizes").doc(id).delete();
        res.send("quiz record deleted successfuly");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getQuizById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await firestore.collection("quizes").doc(id);
        const data = await quiz.get();

        if (!data.exists) {
            res.status(404).send("quiz with the given ID not found");
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getQuizByIdForStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await firestore.collection("quizes").doc(id);
        const data = await quiz.get();
        if (!data.exists) {
            res.status(404).send("quiz with the given ID not found");
        } else {
            let dataForStudent = data.data();
            if (dataForStudent.isLive) {
                res.status(400).send("Quiz already started.");
            } else if (dataForStudent.isEnded) {
                res.status(400).send("Quiz already ended.");
            } else {
                delete dataForStudent.quizTemplate.questions;
                res.send(dataForStudent);
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

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
    let quiz;
    try {
        const pinCode = req.params.pinCode;
        const studentId = req.body.studentId;

        const allQuiz = firestore.collection("quizes");
        const snapshot = await allQuiz.where("pinCode", "==", Number(req.params.pinCode)).get();

        let quizIdFromPinCode;
        if (snapshot.empty) {
            res.status(404).send("Quiz with the given pinCode not found");
        } else {
            snapshot.forEach((doc) => {
                quizIdFromPinCode = doc.id;
            });
            const quizById = await allQuiz.doc(quizIdFromPinCode);
            let getQuiz = await quizById.get();
            quiz = getQuiz.data();

            res.status(200).json({
                quizId: quizIdFromPinCode,
                quizDetails: quiz,
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
};

const deletePinCode = async (req, res, next) => {
    try {
        const id = req.params.quizId;
        const allQuiz = firestore.collection("quizes");
        const quizById = await allQuiz.doc(id);
        var getQuiz = await quizById.get();
        var quiz = getQuiz.data();
        delete quiz["pinCode"];
        await quizById.set(quiz);
        res.send("PinCode deleted!");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    deleteQuiz,
    updateQuiz,
    createQuiz,
    getQuizById,
    joinQuiz,
    getQuizByIdForStudent,
    deletePinCode,
};

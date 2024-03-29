'use strict';

const admin = require('../config/firebase-config');
const firebase = require('../db');
require("firebase/storage");
const storage = firebase.storage().ref();
global.XMLHttpRequest = require("xhr2");
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');

const uploadImageForStudent = async (req, res, next) => {
    try {
        try{
            var decodeToken = jwtDecode(req.headers.token);
            } catch (error) {
               return res.status(401).json({
                    "errCode" : 401,
                    "errText" : "Unauthorized"
                });
            }
        const file = req.files.studizImg;
        console.log(file);
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`;
        console.log(fileName)
        const imageRef = storage.child(fileName);

        const snapshot = await imageRef.put(file.data, {
            contentType: file.mimetype,
        })

        const imageURL = await snapshot.ref.getDownloadURL();
        console.log(imageURL);

        const id = req.params.id;
        const student = await firestore.collection('students').doc(id);
        // console.log(student);
        const dataStudent = await student.get();
        var data = dataStudent.data()
        data.imageUrl = imageURL
        await student.update(data);
        res.status(200).send(data)



        // res.send(downloadURL);
        // res.send(pathReference);
        // res.status(200).send(downloadURL)
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const uploadImageForTeacher = async (req, res, next) => {
    try {
        try{
            var decodeToken = jwtDecode(req.headers.token);
            } catch (error) {
               return res.status(401).json({
                    "errCode" : 401,
                    "errText" : "Unauthorized"
                });
            }
        const file = req.files.studizImg;
        console.log(file);
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`;
        console.log(fileName)
        const imageRef = storage.child(fileName);

        const snapshot = await imageRef.put(file.data, {
            contentType: file.mimetype,
        })

        const imageURL = await snapshot.ref.getDownloadURL();
        console.log(imageURL);

        const id = req.params.id;
        const teacher = await firestore.collection('teachers').doc(id);
        // console.log(student);
        const dataTeacher = await teacher.get();
        var data = dataTeacher.data()
        data.imageUrl = imageURL
        await teacher.update(data);
        res.status(200).send(data)

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateImageForQuizTemplate = async (req, res, next) => {
    try {
        try{
            var decodeToken = jwtDecode(req.headers.token);
            } catch (error) {
               return res.status(401).json({
                    "errCode" : 401,
                    "errText" : "Unauthorized"
                });
            }
        const file = req.files.studizImg;
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`;
        const imageRef = storage.child(fileName);

        const snapshot = await imageRef.put(file.data, {
            contentType: file.mimetype,
        })

        const imageURL = await snapshot.ref.getDownloadURL();

        const id = req.params.id;
        const no = Number(req.params.no)
        const quiz = await firestore.collection('quizTemplates').doc(id);
        const getQuiz = await quiz.get();
        let quizData = await getQuiz.data()
        quizData.questions[no].image = imageURL
        await quiz.update(quizData);
        res.status(200).send(quizData)

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const uploadImage = async (req, res, next) => {
    try {

        const file = req.files.studizImg;
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`;
        const imageRef = storage.child(fileName);

        const snapshot = await imageRef.put(file.data, {
            contentType: file.mimetype,
        })

        const imageURL = await snapshot.ref.getDownloadURL();

        res.status(200).json({
            "imageUrl": imageURL
        })


    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteImage = async (req, res, next) => {
    try {
        const fileUrl = req.body.imageUrl
        const storage = firebase.storage()
        var fileRef = storage.refFromURL(fileUrl)

        fileRef.delete().then(function () {

            console.log("File Deleted")
        }).catch(function (error) {

        });
        res.status(200).send("delete image succes")
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    uploadImageForStudent,
    updateImageForQuizTemplate,
    deleteImage,
    uploadImage,
    uploadImageForTeacher
}
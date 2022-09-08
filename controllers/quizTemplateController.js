'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const middleware = require('../middleware');

const createQuizTemplate = async (req, res, next) => {
    try {
        const data = req.body
        var quizData = data
        await firestore.collection('quizTemplates').doc().set(quizData);
        res.send('quizTemplates record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateQuizTemplate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const quiz = await firestore.collection('quizTemplates').doc(id);
        await quiz.update(data);
        res.send('quizTemplates record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteQuizTemplate = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('quizTemplates').doc(id).delete();
        res.send('quizTemplates record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQuizTemplateByTeacherId = async (req, res, next) => {
    try {
        const teacherId = req.params.id;
        const quizTemplates = await firestore.collection('quizTemplates');
        const data = await quizTemplates.get();
        const quizTemplatesArray = []
        data.forEach(doc => {
            if(doc.data().teacherId === teacherId){
            quizTemplatesArray.push(doc.data());
            }
        });
        
        if (!quizTemplatesArray) {
            res.status(404).send('quizTemplates with the given TeacherId not found');
        } else {
            res.send(quizTemplatesArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQuizTemplateById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await firestore.collection('quizTemplates').doc(id);
        const data = await quiz.get();
        if (!data.exists) {
            res.status(404).send('quizTemplates with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}



module.exports = {
    deleteQuizTemplate,
    updateQuizTemplate,
    createQuizTemplate,
    getQuizTemplateById,
    getQuizTemplateByTeacherId
}
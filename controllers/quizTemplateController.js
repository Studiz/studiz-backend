'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const middleware = require('../middleware');

const createQuiz = async (req, res, next) => {
    try { 
        const data = req.body
        var quizData = {
            data
        }
        await firestore.collection('quizes').doc().set(quizData);
        res.send('Record saved successfuly');
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
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQuizById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await firestore.collection('quizes').doc(id);
        const data = await quiz.get();
        if (!data.exists) {
            res.status(404).send('quiz with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}



module.exports = {
    deleteQuiz,
    updateQuiz,
    createQuiz,  
    getQuizById
}
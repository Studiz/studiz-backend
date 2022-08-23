'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const middleware = require('../middleware');

const createQuiz = async (req, res, next) => {
    try { 
        const data = req.body
        var quizData = {
            data,
            url : makeid(10)
        }
        await firestore.collection('quizes').doc().set(quizData);
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
        if (!data.exists) {
            res.status(404).send('quiz with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}



module.exports = {
    deleteQuiz,
    updateQuiz,
    createQuiz,  
    getQuizById
}
'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();

const getQuizHistoryByStudentId = async (req, res, next) => {
    try {
        const quizHistories = firestore.collection('quizHistories');
        const getquizHistories = await quizHistories.get()
        const quizHistoriesData = await getquizHistories.data()


        if (!data.exists) {
            res.status(404).send('quizHistory with the given student ID not found');
        } else {
            res.send();
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getQuizHistoryByQuizId= async (req, res, next) => {
    try {
        const quizId = req.params.id;
        const quizHistories = await firestore.collection('quizHistories');
        const getquizHistories = await quizHistories.get()
        var quizHistory
        if (getquizHistories.empty) {
            res.status(404).send('No quiz history record found');
        }else
        getquizHistories.forEach(doc => {
            if (doc.data().quizId === quizId) {
                quizHistory = doc.data()
                quizHistory.id = doc.id
            }
        });

        if (!quizHistory) {
            res.status(404).send('quizHistory with the given quiz ID not found');
        } else {
            res.send(quizHistory);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
  
}

const getQuizHistoryById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const quizHistories = await firestore.collection('quizHistories').doc(id);
        const data = await quizHistories.get();
        if (!data.exists) {
            res.status(404).send('quizHistories with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


module.exports = {
    getQuizHistoryByQuizId,
    getQuizHistoryById
}
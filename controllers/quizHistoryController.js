'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const jwtDecode = require('jwt-decode');

// const getQuizHistoryByStudentId = async (req, res, next) => {
//     try {
//         const quizHistories = firestore.collection('quizHistories');
//         const getquizHistories = await quizHistories.get()
//         const quizHistoriesData = await getquizHistories.data()


//         if (!data.exists) {
//             res.status(404).send('quizHistory with the given student ID not found');
//         } else {
//             res.send();
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

const getQuizHistoryByQuizId= async (req, res, next) => {
    try {
        // try{
        // var decodeToken = jwtDecode(req.headers.token);
        // } catch (error) {
        //    return res.status(401).json({
        //         "errCode" : 401,
        //         "errText" : "Unauthorized"
        //     });
        // }
        // if (decodeToken.email) {
        if (true) {
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
    }else res.status(401).send("Unauthorized");
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

const getQuizHistoryByStudentUid = async (req, res, next) => {
    try {
        try{
            var decodeToken = jwtDecode(req.headers.token);
            } catch (error) {
               return res.status(401).json({
                    "errCode" : 401,
                    "errText" : "Unauthorized"
                });
            }
        const uid = req.params.uid;
        const quizHistories = await firestore.collection('quizHistories');
        const data = await quizHistories.get();
        const quizHistoryArray = []
        data.forEach(doc => {
            var students = doc.data().members
            students.forEach(doc2 => {
                if (doc2.user.uid === uid) {
                    let quizHistoy = doc.data()
                    quizHistoy.id = doc.id
                    quizHistoryArray.push(quizHistoy);
                }
            })
           
        });
        if(quizHistoryArray) {
            res.status(200).send(quizHistoryArray);
        }else res.status(404).send("quizHistory with the given student Uid not found")

    } catch (error) {
        res.status(400).send(error.message);
    }
}


module.exports = {
    getQuizHistoryByQuizId,
    getQuizHistoryById,
    getQuizHistoryByStudentUid
}
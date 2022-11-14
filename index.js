"use strict";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config/config");
const studentRoutes = require("./routes/student-routes");
const classroomRoutes = require("./routes/classroom-routes");
const teacherRoutes = require("./routes/teacher-routes");
const userRoutes = require("./routes/user-routes");
const quizTemplateRoutes = require("./routes/quiz-template-routers");
const imageRoutes = require("./routes/image-routes");
const quizRoutes = require("./routes/quiz-routes");
const storeRoutes = require("./routes/item-routes");
const quizHistoryRoutes = require("./routes/quiz-history-routes");
const notificationRoutes = require("./routes/notification-routes");
const socketIO = require("socket.io");
const fileupload = require("express-fileupload");
const firebase = require("./db");
const firestore = firebase.firestore();

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(fileupload());

app.use("/api", studentRoutes.routes);
app.use("/api", classroomRoutes.routes);
app.use("/api", teacherRoutes.routes);
app.use("/api", userRoutes.routes);
app.use("/api", quizTemplateRoutes.routes);
app.use("/api", imageRoutes.routes);
app.use("/api", quizRoutes.routes);
app.use("/api", storeRoutes.routes);
app.use("/api", quizHistoryRoutes.routes);
app.use("/api", notificationRoutes.routes);

const server = app.listen(config.port, () => console.log("App is listening on port " + config.port));

const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: "*",
        credential: "*",
    },
});

const rooms = new Map();

const structuredClone = (objectToClone) => {
    const stringified = JSON.stringify(objectToClone);
    const parsed = JSON.parse(stringified);
    return parsed;
};

const getMembers = (quizId) => {
    try {
        if (quizId) {
            return rooms.get(quizId)?.members ? rooms.get(quizId).members : [];
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
    }
};

const getMemberData = (quizId, memberId) => {
    try {
        return getMembers(quizId).find((member) => member.memberId === memberId);
    } catch (error) {
        console.log(error);
    }
};

const getRoom = (quizId) => {
    try {
        return rooms.get(quizId);
    } catch (error) {
        console.log(error);
    }
};

const getQustionsForStudent = (quizId, index) => {
    let qustion = structuredClone(getRoom(quizId).quizData.questions[index]);
    if (!qustion.type === "poll") {
        qustion.answer.options.map((option) => {
            delete option.isCorrect;
        });
    }
    qustion.currentQuestion = index + 1;
    return qustion;
};

const getCurrentQuestionIndex = (quizId) => {
    return getRoom(quizId)?.currentQuestion ? getRoom(quizId)?.currentQuestion : 0;
};

const hasNextQuestion = (quizId) => {
    return getCurrentQuestionIndex(quizId) < getRoom(quizId)?.quizData.questions.length - 1;
};

const nextQuestion = (quizId) => {
    getRoom(quizId).currentQuestion++;
    // getRoom(quizId).quizData.questions[getCurrentQuestionIndex(quizId)]
    return getQustionsForStudent(quizId, getCurrentQuestionIndex(quizId));
};

const checkAnswers = (quizId, answer) => {
    let studentAnswer = false;
    let questionData = structuredClone(getCurrentQuestionData(quizId));

    if (questionData.type === "single") {
        studentAnswer = questionData.answer.options[answer.index].isCorrect;
    }

    if (questionData.type === "multiple") {
        studentAnswer = true;
        for (let i = 0; i < answer.length; i++) {
            if (!questionData.answer.options[answer[i].index].isCorrect) {
                studentAnswer = false;
            }
        }
    }

    if (questionData.type === "true/false") {
        studentAnswer = !answer.index == questionData.answer;
    }

    return studentAnswer;
};

const correctAnswer = (quizId) => {
    let questionData = structuredClone(getCurrentQuestionData(quizId));
    if (questionData.type === "single") {
        return questionData.answer.options.findIndex((option) => option.isCorrect);
    }

    if (questionData.type === "multiple") {
        let indexCorrectAnswer = [];
        for (let i = 0; i < questionData.answer.options.length; i++) {
            if (questionData.answer.options[i].isCorrect) {
                indexCorrectAnswer.push(i);
            }
        }
        return indexCorrectAnswer;
    }

    if (questionData.type === "true/false") {
        return questionData.answer ? 0 : 1;
    }
};

const getCurrentQuestionData = (quizId) => {
    return getRoom(quizId).quizData.questions[getCurrentQuestionIndex(quizId)];
};

const saveQuizHistory = async (data, quizId) => {
    // data.createAt = new Date()
    data.quizId = quizId;
    let quizHistory = structuredClone(data);
    //Set quizHistory data
    quizHistory.quizData.numberQuestions = quizHistory.quizData.questions.filter((question) => {
        return question.type !== "poll";
    }).length;
    quizHistory.members.map((member) => {
        member.numberCorrectAnswers = member.quizData.filter((quiz) => {
            return quiz.studentAnswer;
        }).length;
        member.numberInCorrectAnswers = member.quizData?.filter((quiz) => {
            return !quiz.studentAnswer && quiz.type !== "poll";
        }).length;
    });
    const quizHistoryNew = await firestore.collection("quizHistories").add(structuredClone(quizHistory));
    const quizHistoryId = await quizHistoryNew.id;
    if (data.quizData.classroomId) {
        const classroom = await firestore.collection("classrooms").doc(data.quizData.classroomId);
        const getClassroom = await classroom.get();
        const classroomData = await getClassroom.data();
        //Update classroomName
        const quizHistory = await firestore.collection("quizHistories").doc(quizHistoryId);
        const getQuizHistory = await quizHistory.get();
        const quizHistoryData = await getQuizHistory.data();
        quizHistoryData.quizData.classroomName = await classroomData.name;
        await quizHistory.update(quizHistoryData);

        //เดี๋ยวมาดูหลังสอบ
        // var quizData = data.quizData
        // delete quizData.quistion
        // var historyInClass = {
        //     "quizId": data.quizId,
        //     "quizData": quizData,
        //     "crateAt ": data.createAt
        // }

        // if (classroomData.quizHistories) {
        //     classroomData.quizHistories.push(historyInClass)
        // } else classroomData.quizHistories = [historyInClass]

        // await classroom.update(classroomData);
    }
    return data;
};

const endQuiz = async (quizId) => {
    const quiz = await firestore.collection("quizes").doc(quizId);
    const getQuiz = await quiz.get();
    const quizData = await getQuiz.data();

    quizData.isLive = false;
    await quiz.update(quizData);

    return quizData;
};

const startQuiz = async (quizId) => {
    const quiz = await firestore.collection("quizes").doc(quizId);
    const getQuiz = await quiz.get();
    const quizData = await getQuiz.data();

    quizData.isLive = true;
    await quiz.update(quizData);

    return quizData;
};

const pushNotification = async (notification) => {
    const classroom = await firestore.collection("classrooms").doc(notification.classroomId);
    const classroomData = await classroom.get();
    const students = await classroomData.data().students;
    students.forEach(async (student) => {
        notification.uid = student.uid;
        notification.isRead = false;
        const notificationDoc = await firestore.collection("notifications").add(notification);
        const notificationId = await notificationDoc.id;
        const notificationForSetId = await firestore.collection("notifications").doc(notificationId);
        const getnotification = await notificationForSetId.get();
        const notificationData = getnotification.data();
        notificationData.id = notificationId;
        await notificationForSetId.update(notificationData);
    });
};

const alreadyHasQuiz = (quizId) => {
    return rooms.has(quizId);
};

io.on("connection", async (socket) => {
    console.log("client socket connected");

    socket.on("join-classrooms", (data) => {
        socket.join(data);
    });

    socket.on("leave-classrooms", (data) => {
        socket.leave(data);
    });

    socket.on("init-game", (data) => {
        if (!alreadyHasQuiz(data.quizId)) {
            let notificationData = Object.assign({}, data.quizData);
            notificationData.quizId = data.quizId;
            delete notificationData.questions;

            if (notificationData.classroomId) {
                pushNotification(notificationData).then(() => {
                    io.to(data.quizData.classroomId).emit("notification-quiz", notificationData);
                });
            }
        }

        socket.join(data.quizId);
        let defaultData = {
            members: new Array(),
            quizData: data.quizData,
            currentQuestion: 0,
            leaderboard: {},
        };

        rooms.set(data.quizId, defaultData);
    });

    socket.on("join-lobby", (data) => {
        socket.join(data.quizId);
        if (alreadyHasQuiz(data.quizId)) {
            if (getMembers(data.quizId).length > 0) {
                if (!getMembers(data.quizId).some((member) => member.memberId === data.memberId)) {
                    getMembers(data.quizId).push(data);
                } else {
                    let index = getMembers(data.quizId).findIndex((member) => member.memberId === data.memberId);
                    getMembers(data.quizId)[index].socketId = data.socketId;
                }
            } else {
                getMembers(data.quizId).push(data);
            }
            io.to(data.quizId).emit("joined", getMembers(data.quizId));
        } else {
            io.to(data.quizId).emit("quiz-end");
            socket.leave(data.quizId);
        }
    });

    socket.on("leave-lobby", (data) => {
        if (getMembers(data.quizId).length > 0) {
            let index = getMembers(data.quizId).findIndex((member) => member.memberId === data.memberId);
            getMembers(data.quizId).splice(index, 1);
            io.to(data.quizId).emit("joined", getMembers(data.quizId));
            socket.leave(data.quizId);
        }
    });

    socket.on("start-game", (data) => {
        let currentQuestion = getCurrentQuestionIndex(data.quizId);
        startQuiz(data.quizId);
        io.to(data.quizId).emit("move-to-quiz", getQustionsForStudent(data.quizId, currentQuestion));
    });

    socket.on("end-game", (data) => {
        endQuiz(data.quizId);
        io.to(data.quizId).emit("move-to-home");
        socket.leave(data.quizId);
        rooms.delete(data.quizId);
    });

    socket.on("select-choice", (data) => {
        let useItemAddScore = data?.item?.code.includes("P");
        let questionData = structuredClone(getCurrentQuestionData(data.quizId));
        let score = Math.round(1000 * (1 - (data.timeAnswer / questionData.time) * (1 / 2)));
        if (useItemAddScore) {
            score = Math.round(score * data.item.value);
        }
        if (data.item) {
            questionData.item = data.item;
        }
        questionData.score = checkAnswers(data.quizId, data.answer) ? score : 0;
        questionData.studentAnswer = checkAnswers(data.quizId, data.answer);
        questionData.indexStudentAnswer = data.answer.index;
        if (questionData.type === "multiple") {
            questionData.indexStudentAnswer = data.answer.map((answer) => answer.index);
        }
        if (!(questionData.type === "poll")) {
            getMemberData(data.quizId, data.memberId).quizData.push(questionData);
            getMemberData(data.quizId, data.memberId).totalScore += questionData.score;
            io.to(data.quizId).emit("check-answer", correctAnswer(data.quizId));
        } else {
            questionData.answer.options[data.answer.index].selected = 1;
            getMemberData(data.quizId, data.memberId)?.quizData.push(questionData);
        }
        let numStudentAnswer = getMembers(data.quizId).filter((member) => member.quizData.length === getCurrentQuestionIndex(data.quizId) + 1).length;
        io.to(data.quizId).emit("show-number-answers", numStudentAnswer);
    });

    socket.on("send-leaderboard", (data) => {
        let leaderboard = getMembers(data.quizId).map((member) => {
            return {
                displayName: member.user.displayName,
                role: member.user.role,
                image: member.user.imageUrl,
                scoreInRound: member.quizData[getCurrentQuestionIndex(data.quizId)]?.score,
                score: member.totalScore,
            };
        });
        io.to(data.quizId).emit("show-leaderboard", leaderboard);
    });

    socket.on("get-poll-result", (data) => {
        let questionData = structuredClone(getCurrentQuestionData(data.quizId));
        let listPoll = [];
        let allChoice = questionData.answer.options;
        let allAnswer = getMembers(data.quizId).filter((member) => {
            return member.quizData[getCurrentQuestionIndex(data.quizId)]?.answer.options.some((option) => option.selected === 1);
        }).length;

        for (let i = 0; i < allChoice.length; i++) {
            allChoice[i].selected = getMembers(data.quizId).filter((member) => {
                return member.quizData[getCurrentQuestionIndex(data.quizId)]?.answer.options[i].selected === 1;
            }).length;

            listPoll.push(allChoice[i].selected > 0 ? Math.round((allChoice[i].selected / allAnswer) * 100) : 0);
        }

        for (let i = 0; i < questionData.answer.options.length; i++) {
            questionData.answer.options[i].selected = listPoll[i];
        }

        getMembers(data.quizId).forEach((member) => {
            member.quizData[getCurrentQuestionIndex(data.quizId)] = questionData;
        });

        io.to(data.quizId).emit("show-poll-result", listPoll);
    });

    socket.on("send-next-question", (data) => {
        // getCurrentQuestionIndex(data.quizId) = getCurrentQuestionIndex(data.quizId) + 1
        // nextQuestion(data.quizId)
        if (hasNextQuestion(data.quizId)) {
            io.to(data.quizId).emit("show-next-question", nextQuestion(data.quizId));
        } else {
            let leaderboard = getMembers(data.quizId).map((member) => {
                return {
                    displayName: member.user.displayName,
                    role: member.user.role,
                    image: member.user.imageUrl,
                    score: member.totalScore,
                };
            });

            //Sort leaderboard
            getRoom(data.quizId).leaderboard.members = leaderboard.sort((member1, member2) => {
                return member2.score - member1.score;
            });
            //Set the winner
            getRoom(data.quizId).leaderboard.winner = getRoom(data.quizId).leaderboard.members[0];

            //Save quiz history
            saveQuizHistory(rooms.get(data.quizId), data.quizId).then((data) => {
                io.to(data.quizId).emit("show-quiz-summary", rooms.get(data.quizId));
                endQuiz(data.quizId);
                rooms.delete(data.quizId);
                socket.leave(data.quizId);
            });
        }
    });

    socket.on("disconnect", () => {
        rooms.forEach((value, key) => {
            if (value.members.length > 0) {
                if (value.members.some((member) => member.socketId === socket.id)) {
                    let index = value.members.findIndex((member) => member.socketId === socket.id);
                    value.members.splice(index, 1);
                    io.to(key).emit("joined", value.members);
                    socket.leave(key);
                }
            }
        });
    });
});

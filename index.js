'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const studentRoutes = require('./routes/student-routes');
const classroomRoutes = require('./routes/classroom-routes');
const teacherRoutes = require('./routes/teacher-routes');
const userRoutes = require('./routes/user-routes');
const quizTemplateRoutes = require('./routes/quiz-template-routers');
const imageRoutes = require('./routes/image-routes');
const quizRoutes = require('./routes/quiz-routes');
const storeRoutes = require('./routes/item-routes');
const socketIO = require('socket.io')
const fileupload = require('express-fileupload');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(fileupload());

app.use('/api', studentRoutes.routes);
app.use('/api', classroomRoutes.routes);
app.use('/api', teacherRoutes.routes);
app.use('/api', userRoutes.routes);
app.use('/api', quizTemplateRoutes.routes);
app.use('/api', imageRoutes.routes);
app.use('/api', quizRoutes.routes);
app.use('/api', storeRoutes.routes);

const server = app.listen(config.port, () => console.log('App is listening on port ' + config.port));


const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: "*",
        credential: "*"
    }
})

let game
let leaderboard
let members = []

const addPlayer = (user, socketId) => {
    !members.some((member) => member.socketId === socketId) &&
        members.push({
            user,
            socketId
        })
}

const getMember = (socketId) => {
    return members.find((member) => member.socketId === socketId)
}


io.on('connection', async (socket) => {
    console.log('client socket connected')

    socket.on("init-game", (newGame, newLeaderboard) => {
        // game = JSON.parse(JSON.stringify(newGame))
        // leaderboard = JSON.parse(JSON.stringify(newLeaderboard))
        // socket.join(game.pin)
        // hostId = socket.id
    })

    socket.on('join-lobby', async (data) => {
        let user = await data
        members.push(user)
        socket.join(data.quizId)
        addPlayer(data.user, data.socketId)
        console.log(members);
        io.emit("joined", members)
        // socket.to(data.quizId).emit('joined', members)
        // socket.emit('load-members', members)
        // socket.join(data.quizId)
        // socket.members.push(data.user)
        // members.push(data.user)

        // socket.to(data.quizId).emit('joined', socket.members)
    })



})

// function createSocketIO(url) {
//     if (!urlList.includes(url)) {

//     }
//     const quizIo = socketIO(server + '/create/quiz/' + url)
//     quizIo.on('connection', (socket) => {
//         console.log('client socket connected')

//         socket.on('student', (response) => {
//             console.log(response)
//             const students = []
//             students.push(response)
//             io.sockets.emit('lobby', response)
//         })
//     })
// }


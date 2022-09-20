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


io.on('connection', (socket) => {
    console.log('client socket connected')

    socket.displayName = "Guest"

    socket.on('join-lobby', (data) => {
        socket.join(data.room, () => {

        })
        console.log(data);
    })

    // socket.on('student', (response) => {
    //     console.log(response)
    //     const students = []
    //     students.push(response)
    //     io.sockets.emit('lobby', response)
    // })
})

function createSocketIO(url) {
    if (!urlList.includes(url)) {

    }
    const quizIo = socketIO(server + '/create/quiz/' + url)
    quizIo.on('connection', (socket) => {
        console.log('client socket connected')

        socket.on('student', (response) => {
            console.log(response)
            const students = []
            students.push(response)
            io.sockets.emit('lobby', response)
        })
    })
}

// const classroomIo = socketIO(server + '/create/quiz/' + url)
// classroomIo.on('connection', (socket) => {
//     console.log('client socket connected')

//     socket.on('student', (response) => {
//         console.log(response)
//         const students = []
//         students.push(response)
//         io.sockets.emit('classroom', response)
//     })
// })
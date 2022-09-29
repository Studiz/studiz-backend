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

const rooms = new Map();

const getMembers = async (quizId) => {
    return await rooms.get(quizId).members
}

const getRoom = (quizId) => {
    return rooms.get(quizId)
}

io.on('connection', async (socket) => {
    console.log('client socket connected')

    socket.on("init-game", (data) => {
        socket.join(data.quizId)
        let defaultData = {
            members: new Array(),
            quizData: data.quizData,
            game: {},
            leaderboard: {}
        }

        rooms.set(data.quizId, defaultData);
    })

    socket.on('join-lobby', (data) => {
        socket.join(data.quizId)
        if (!getMembers(data.quizId).some((member) => member.memberId === data.memberId)) {
            getMembers(data.quizId).push(data)
        }
        io.to(data.quizId).emit("joined", getMembers(data.quizId));
    })

    socket.on('leave-lobby', (data) => {
        let index = getMembers(data.quizId).findIndex((member) => member.memberId === data.memberId)
        getMembers(data.quizId).splice(index, 1)
        socket.leave(data.quizId)
        io.to(data.quizId).emit("joined", getMembers(data.quizId));
    })
})
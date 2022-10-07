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

const getMembers = (quizId) => {
    if (quizId) {
        return rooms.get(quizId).members ? rooms.get(quizId).members : []
    } else {
        return []
    }
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
        if (getMembers(data.quizId).length > 0) {
            if (!getMembers(data.quizId).some((member) => member.memberId === data.memberId)) {
                getMembers(data.quizId).push(data)
            } else {
                let index = getMembers(data.quizId).findIndex((member) => member.memberId === data.memberId)
                getMembers(data.quizId)[index].socketId = data.socketId
            }
        } else {
            getMembers(data.quizId).push(data)
        }

        io.to(data.quizId).emit("joined", getMembers(data.quizId));
    })

    socket.on('leave-lobby', (data) => {
        if (getMembers(data.quizId).length > 0) {
            let index = getMembers(data.quizId).findIndex((member) => member.memberId === data.memberId)
            getMembers(data.quizId).splice(index, 1)
            io.to(data.quizId).emit("joined", getMembers(data.quizId));
            socket.leave(data.quizId)
        }
    })

    socket.on('end-game', (data) => {
        io.to(data.quizId).emit("move-to-home");
        socket.leave(data.quizId)
        rooms.delete(data.quizId)
    })

    socket.on("disconnect", () => {
        rooms.forEach((value, key) => {
            if (value.members.length > 0) {
                if (value.members.some((member) => member.socketId === socket.id)) {
                    let index = value.members.findIndex((member) => member.socketId === socket.id)
                    value.members.splice(index, 1)
                    io.to(key).emit("joined", value.members);
                    socket.leave(key)
                }
            }


        })

    });
})
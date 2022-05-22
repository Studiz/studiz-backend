'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const studentRoutes = require('./routes/student-routes');
const classroomRoutes = require('./routes/classroom-routes');
const teacherRoutes = require('./routes/teacher-routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api', studentRoutes.routes);
app.use('/api', classroomRoutes.routes);
app.use('/api', teacherRoutes.routes);


app.listen(config.port, () => console.log('App is listening on port ' + config.port));

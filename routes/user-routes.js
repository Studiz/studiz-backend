const express = require('express');
const {
    checkDuplicateEmail
} = require('../controllers/userController');

const router = express.Router();

router.post('/user/checkDuplicateEmail', checkDuplicateEmail);


module.exports = {
    routes: router
}
const express = require('express');
const {
    checkDuplicateEmail, signInUser
} = require('../controllers/userController');

const router = express.Router();

router.post('/user/checkDuplicateEmail', checkDuplicateEmail);
router.post('/user/signIn', signInUser);



module.exports = {
    routes: router
}
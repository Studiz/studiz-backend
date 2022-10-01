const express = require('express');
const {
    checkDuplicateEmail, signInUser, getCustomTokenByUid
} = require('../controllers/userController');

const router = express.Router();

router.get('/user/checkDuplicateEmail', checkDuplicateEmail);
router.post('/user/signIn', signInUser);
router.get('/user/getCustomToken/:uid', getCustomTokenByUid);



module.exports = {
    routes: router
}
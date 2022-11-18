const express = require('express');
const {getAllTag} = require('../controllers/tagController');
const router = express.Router();

router.get('/getAlltag', getAllTag);

module.exports = {
    routes: router
}
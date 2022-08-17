'use strict';

const admin = require('../config/firebase-config');
const firebase = require('../db');
const Classroom = require('../models/classroom');
const { getStorage } = require('firebase-admin/storage');
const bucket = getStorage().bucket('gs://studiz-ce53f.appspot.com');
// var FormData = require('form-data');

const uploadImage = async (req, res, next) => {
    try { 
        // var form = new FormData()
       
      bucket.upload("")
        res.send('Image saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    uploadImage
}
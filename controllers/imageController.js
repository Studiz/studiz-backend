'use strict';

const admin = require('../config/firebase-config');
const firebase = require('../db');
require("firebase/storage");
const storage = firebase.storage().ref();
global.XMLHttpRequest = require("xhr2");
const firestore = firebase.firestore();

const uploadImageForStudent = async (req, res, next) => {
    try {
        const storage = firebase.storage().ref()
        const file = req.files.studizImg;
        console.log(file);
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`;
        console.log(fileName)
        const imageRef = storage.child(fileName);
    
        const snapshot = await imageRef.put(file.data, {
            contentType: file.mimetype,
        })
  
        const imageURL = await snapshot.ref.getDownloadURL();
        console.log(imageURL);
     
            const id = req.params.id;
            const student = await firestore.collection('students').doc(id);
            // console.log(student);
            const dataStudent = await student.get();
            var data = dataStudent.data()
            data.imageUrl = imageURL
            await student.update(data);
            res.send(data)

        

        // res.send(downloadURL);
        // res.send(pathReference);
        // res.status(200).send(downloadURL)
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    // uploadImage,
    uploadImageForStudent
}
"use strict";

const firebase = require("../db");
const firestore = firebase.firestore();

const getAllTag = async (req, res, next) => {
    try {
        const tag = await firestore.collection("tags");
        const data = await tag.get();
        const tagArray = [];

        data.forEach((doc) => {
            const docData = doc.data();
            docData.id = doc.id
            tagArray.push(docData);
        });
        res.send(tagArray);

    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    getAllTag
};
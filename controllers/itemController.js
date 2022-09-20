'use strict';

const firebase = require('../db');
const firestore = firebase.firestore();
const middleware = require('../middleware');

const addItemInStore = async (req, res, next) => {
    try {

        const item = req.body
        await firestore.collection('items').add(item);
        res.status(200).send(item);
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const deleteItem = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('items').doc(id).delete();
        res.send('item record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}



const getItemById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const item = await firestore.collection('items').doc(id);
        const data = await item.get();

        if (!data.exists) {
            res.status(404).send('item with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const getAllItem = async (req, res, next) => {
    try {
        const item = await firestore.collection('items');
        const data = await item.get();
        const itemArray = []
        if (data.empty) {
            res.status(404).send('No student record found');
        } else {
            data.forEach(doc => {
                const docData = doc.data()
                var x = {
                    id : doc.id,
                    itemData : docData
                }
                
                itemArray.push(x);
            });
            res.send(itemArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addItemInStore,
    deleteItem,
    getItemById,
    getAllItem
}
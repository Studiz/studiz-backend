"use strict";

const firebase = require("../db");
const firestore = firebase.firestore();
const middleware = require("../middleware");

const addItemInStore = async (req, res, next) => {
    try {
        const item = req.body;
        await firestore.collection("items").add(item);
        res.status(200).send(item);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteItem = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection("items").doc(id).delete();
        res.send("item record deleted successfuly");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getItemById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const item = await firestore.collection("items").doc(id);
        const data = await item.get();

        if (!data.exists) {
            res.status(404).send("item with the given ID not found");
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getAllItem = async (req, res, next) => {
    try {
        const item = await firestore.collection("items");
        const data = await item.get();
        const itemArray = [];
        if (data.empty) {
            res.status(404).send("No item record found");
        } else {
            data.forEach((doc) => {
                const docData = doc.data();
                var itemData = {
                    id: doc.id,
                    itemData: docData,
                };

                itemArray.push(itemData);
            });
            res.send(itemArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const randomItems = async (req, res, next) => {
    try {
        const item = await firestore.collection("items");
        const data = await item.get();
        const itemArray = [];
        const randomItems = [];
        const numberItems = req.params.numberItems;
        if (data.empty) {
            res.status(404).send("No item record found");
        } else {
            data.forEach((doc) => {
                const docData = doc.data();
                var itemData = {
                    id: doc.id,
                    itemData: docData,
                };
                itemArray.push(itemData);
            });

            for (let i = 0; i < numberItems; i++) {
                const randomItem = itemArray[Math.floor(Math.random() * itemArray.length)];
                randomItems.push(randomItem);
            }

            res.send(randomItems);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    addItemInStore,
    deleteItem,
    getItemById,
    getAllItem,
    randomItems,
};

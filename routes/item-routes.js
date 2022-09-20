const express = require('express');
const { addItemInStore, getItemById, getAllItem, deleteItem } = require('../controllers/itemController');
const router = express.Router();

// router.post('/upload/image',uploadImage);
router.post('/add/item', addItemInStore);
router.get('/getItem/id/:id', getItemById);
router.get('/getAllItem', getAllItem);
router.delete('/delete/item/:id', deleteItem);


module.exports = {
    routes: router
}
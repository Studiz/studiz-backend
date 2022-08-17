
const admin = require("firebase-admin");
// const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // storageBucket: 'gs://studiz-ce53f.appspot.com'
});

// const bucket = getStorage().bucket();

module.exports = admin;
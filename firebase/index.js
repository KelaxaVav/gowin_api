const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase.json");

const firebase = admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount)
});

module.exports = firebase;
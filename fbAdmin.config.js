var admin = require("firebase-admin");
var serviceAccount = require("./fbServiceAccountKey.json");

!admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

module.exports = admin;

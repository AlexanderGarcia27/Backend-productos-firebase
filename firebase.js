const admin = require("firebase-admin");

let serviceAccount;

// Render → usa variable de entorno
if (process.env.KEY_JSON) {
  serviceAccount = JSON.parse(process.env.KEY_JSON);
}
// Local → usa key.json normal
else {
  serviceAccount = require("./key.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { db };

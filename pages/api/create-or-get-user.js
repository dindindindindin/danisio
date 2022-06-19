import query from "../../db";
const admin = require("../../fbAdmin.config");

async function createOrGetUser(req, res) {
  try {
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.headers.authtoken);

    req.user = firebaseUser;
  } catch (err) {
    res.status(401).json({ err: "invalid or expired token" });
    return;
  }

  const user = await query(
    `SELECT * FROM users WHERE email = '${req.user.email}';`
  );

  if (user.length === 0) {
    await query(`INSERT INTO users (email) VALUES ('${req.user.email}');`);

    res.json("user created in db.");
    return;
  }
  res.json(user[0]);
}

export default createOrGetUser;

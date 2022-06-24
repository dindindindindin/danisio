import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function firstLastAboutUpdate(req, res) {
  //check token
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.cookies.idToken);

    req.user = firebaseUser;
  } catch (err) {
    res.status(401).json({ err: "invalid or expired token" });
    return;
  }

  //retrieve userId
  try {
    var userId = await query(
      `SELECT id FROM users WHERE email = '${req.user.email}'`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve userId error" });
    return;
  }

  //update db
  try {
    await query(
      `UPDATE consultants SET first_name = '${req.body.firstName}', last_name = '${req.body.lastName}', about = '${req.body.aboutMe}' WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "db update error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

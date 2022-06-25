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

  //insert into consultant_countries
  try {
    await query(
      `INSERT INTO consultant_countries (user_id, country_id) VALUES (${userId[0].id}, ${req.body.id});`
    );
  } catch (err) {
    res.status(500).json({ error: "insert country error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

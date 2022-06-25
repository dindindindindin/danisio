import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function countryRemove(req, res) {
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

  //delete from db
  try {
    await query(
      `DELETE FROM consultant_countries WHERE user_id = ${userId[0].id} AND country_id = ${req.body.countryId};`
    );
  } catch (err) {
    res.status(500).json({ error: "consultant_countries deletion error" });
    return;
  }
  res.status(200).json({ success: "success" });
}

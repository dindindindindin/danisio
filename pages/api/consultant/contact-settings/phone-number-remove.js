import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function phoneNumberRemove(req, res) {
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
      `SELECT id FROM users WHERE email = '${req.user.email}';`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve userId error" });
    return;
  }

  //remove number
  try {
    await query(
      `DELETE FROM phone_numbers WHERE id = ${req.body.numberId} AND user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "remove number error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

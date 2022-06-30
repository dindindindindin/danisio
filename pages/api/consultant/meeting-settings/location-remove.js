import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function getAddresses(req, res) {
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

  //remove location
  try {
    await query(
      `DELETE FROM consultant_locations WHERE id = ${req.body.locationId} AND user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "remove location error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

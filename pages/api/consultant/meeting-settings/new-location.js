import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function newAddress(req, res) {
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

  //insert new address
  try {
    await query(
      `INSERT INTO consultant_locations (user_id, city_id, location) VALUES (${userId[0].id}, ${req.body.cityId}, '${req.body.location}');`
    );
  } catch (err) {
    res.status(500).json({ error: "add new location error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

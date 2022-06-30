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

  //update location
  try {
    await query(
      `UPDATE consultant_locations SET city_id = ${req.body.cityId}, location = '${req.body.location}' WHERE user_id = ${userId[0].id} AND id = ${req.body.locationId};`
    );
  } catch (err) {
    res.status(500).json({ error: "update location error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

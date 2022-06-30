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

  //retrieve locations
  try {
    var locations = await query(
      `SELECT consultant_locations.id, city_id, location, city, state FROM consultant_locations INNER JOIN cities ON cities.id = consultant_locations.city_id LEFT JOIN states ON states.id = cities.state_id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve address error" });
    return;
  }

  res.status(200).json(locations);
}

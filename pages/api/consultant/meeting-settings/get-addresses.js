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

  //retrieve addresses
  try {
    var addresses = await query(
      `SELECT consultant_addresses.id, city_id, address, is_primary, city, state FROM consultant_addresses INNER JOIN cities ON cities.id = consultant_addresses.city_id INNER JOIN states ON states.id = cities.state_id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "add new address error" });
    return;
  }

  res.status(200).json(addresses);
}

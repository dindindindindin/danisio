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

  //retrieve cities
  try {
    console.log(req.body.countryId);
    var cities = await query(
      `SELECT cities.id, city, state FROM cities LEFT JOIN states ON states.id = cities.state_id WHERE cities.country_id = ${req.body.countryId};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve cities error" });
    return;
  }

  res.status(200).json(cities);
}

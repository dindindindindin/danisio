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

  //retrieve country id
  try {
    var countryId = await query(
      `SELECT id FROM countries WHERE code = '${req.body.countryCode}';`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve countryId error" });
    return;
  }

  //insert the phone number
  try {
    await query(
      `INSERT INTO phone_numbers (user_id, number, dial_code, contact_type_id, country_id) VALUES (${userId[0].id}, '${req.body.number}', '${req.body.dialCode}', ${req.body.contactTypeId}, ${countryId[0].id});`
    );
  } catch (err) {
    res.status(500).json({ error: "insert number error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

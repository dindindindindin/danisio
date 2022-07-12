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

  try {
    var phoneNumbers = await query(
      `SELECT phone_numbers.id, number, dial_code, type FROM phone_numbers INNER JOIN contact_types ON contact_types.id = phone_numbers.contact_type_id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve numbers error" });
    return;
  }

  res.status(200).json(phoneNumbers);
}

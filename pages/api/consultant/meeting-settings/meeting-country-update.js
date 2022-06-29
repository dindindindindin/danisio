import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function meetingCountryUpdate(req, res) {
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

  //retrieve the current country_id
  try {
    var countryId = await query(
      `SELECT country_id FROM consultants WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve current country error" });
    return;
  }

  //if chosen country is not equal to current country
  if (countryId[0].country_id !== req.body.countryId) {
    //delete the addresses first
    try {
      await query(
        `DELETE FROM consultant_addresses WHERE user_id = ${userId[0].id};`
      );
    } catch (err) {
      res.status(500).json({ error: "delete consultant countries error" });
      return;
    }

    //update the country_id in consultants
    try {
      await query(
        `UPDATE consultants SET country_id = ${req.body.countryId} WHERE user_id = ${userId[0].id};`
      );
    } catch (err) {
      res.status(500).json({ error: "update meeting country error" });
      return;
    }
  }
  res.status(200).json({ success: "success" });
}

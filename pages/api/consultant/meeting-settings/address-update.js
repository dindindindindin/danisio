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

  if (req.body.isPrimary) {
    //retrieve addresses to check for primary
    try {
      var addresses = await query(
        `SELECT id, is_primary FROM consultant_addresses WHERE user_id = ${userId[0].id}`
      );
    } catch (err) {
      res.status(500).json({ error: "retrieve addresses error" });
      return;
    }

    //change the primary addresses to false
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].is_primary)
        await query(
          `UPDATE consultant_addresses SET is_primary = false WHERE user_id = ${userId[0].id} AND id = ${addresses[i].id};`
        );
    }
  }

  //update address
  try {
    await query(
      `UPDATE consultant_addresses SET city_id = ${req.body.cityId}, address = '${req.body.address}', is_primary = ${req.body.isPrimary} WHERE user_id = ${userId[0].id} AND id = ${req.body.addressId};`
    );
  } catch (err) {
    res.status(500).json({ error: "update address error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

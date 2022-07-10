import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");

export default async function intervalRemove(req, res) {
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
    await query(
      `DELETE e FROM time_exclusions e INNER JOIN time_intervals i ON i.id = e.time_interval_id WHERE time_interval_id = ${req.body.id} AND user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "delete exclusions error" });
    return;
  }
  console.log(req.body.id);
  try {
    await query(
      `DELETE d FROM time_interval_days d INNER JOIN time_intervals i ON i.id = d.time_interval_id WHERE time_interval_id = ${req.body.id} AND user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "delete interval_days error" });
    return;
  }

  try {
    await query(
      `DELETE FROM time_intervals WHERE id = ${req.body.id} AND user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "delete interval error" });
    return;
  }

  res.status(200).json({ success: "success" });
}

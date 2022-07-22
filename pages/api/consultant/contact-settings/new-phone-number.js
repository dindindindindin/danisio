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

  //check if same phone number exists

  //retrieve user's numbers and contact types
  try {
    var numbers = await query(
      `SELECT number, type FROM phone_numbers INNER JOIN contact_types ON contact_types.id = phone_numbers.contact_type_id WHERE user_id = ${userId[0].id};`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve user's numbers and types error" });
    return;
  }

  //for each of user's numbers
  for (let i = 0; i < numbers.length; i++) {
    //if the number is already entered by the same user
    if (numbers[i].number === req.body.number) {
      res.status(500).json({
        error: "same number by the same user exists",
        errorCode: "same-number-same-user",
      });
      return;
    }
  }

  //retrieve the id of Personal contact type
  try {
    var personalTypeId = await query(
      `SELECT id FROM contact_types WHERE type = 'Personal';`
    );
  } catch (err) {
    res.status(500).json({ error: "retrieve personal type id error" });
    return;
  }

  //if the contact type is personal
  if (req.body.contactTypeId === personalTypeId[0].id) {
    //search for same number in all numbers
    try {
      var sameNumbers = await query(
        `SELECT number FROM phone_numbers WHERE number = '${req.body.number}';`
      );
    } catch (err) {
      res.status(500).json({ error: "retrieve same numbers error" });
      return;
    }

    //if there's a same number
    if (sameNumbers.length !== 0) {
      console.log(sameNumbers);
      res.status(500).json({
        error: "same number by another user exists",
        errorCode: "same-number-different-user",
      });
      return;
    }
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

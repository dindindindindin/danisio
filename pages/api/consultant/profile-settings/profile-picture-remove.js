import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");
var fs = require("fs");

async function profilePictureRemove(req, res) {
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.cookies.idToken);

    req.user = firebaseUser;
  } catch (err) {
    res.status(401).json({ err: "invalid or expired token" });
    return;
  }
  let filePath = `./public/images/${req.user.email}/profile-picture.jpg`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  const userId = await query(
    `SELECT users.id, profile_picture_url FROM users INNER JOIN consultants ON consultants.user_id = users.id WHERE email = '${req.user.email}'`
  );

  if (userId[0].profile_picture_url !== "/images/default-profile-picture.png") {
    await query(
      `UPDATE consultants SET profile_picture_url = '/images/default-profile-picture.png' WHERE user_id = ${userId[0].id}`
    );
    res.status(200).json({ success: "image url updated" });
    return;
  }
  res.status(200).json({ success: "image url already default" });
}

export default profilePictureRemove;

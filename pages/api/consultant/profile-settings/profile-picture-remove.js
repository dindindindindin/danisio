import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");
var fs = require("fs");

async function profilePictureRemove(req, res) {
  //token check
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.cookies.idToken);

    req.user = firebaseUser;
  } catch (err) {
    res.status(401).json({ err: "invalid or expired token" });
    return;
  }

  //retrieve id and profilePicUrl from db
  const userId = await query(
    `SELECT users.id, profile_picture_url FROM users INNER JOIN consultants ON consultants.user_id = users.id WHERE email = '${req.user.email}'`
  );

  //remove folder if exists
  let filePath = `./public/images/${userId[0].id}/profile-picture.jpg`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  //if profile pic url is not default change it to default
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

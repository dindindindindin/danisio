import query from "../../../../db";
const admin = require("../../../../fbAdmin.config");
import multer from "multer";
import nextConnect from "next-connect";
import sharp from "sharp";
var fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};

var storage = multer.memoryStorage();

var upload = multer({ storage: storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(async (req, res, next) => {
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.cookies.idToken);

    req.user = firebaseUser;
    next();
  } catch (err) {
    res.status(401).json({ err: "invalid or expired token" });
    return;
  }
});

apiRoute.use(upload.single("imagefile"));

apiRoute.post(async (req, res) => {
  let dir = `./public/images/${req.user.email}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  sharp(req.file.buffer)
    .resize(400, 400)
    .toFile(
      `./public/images/${req.user.email}/profile-picture.jpg`,
      async (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "resizing image error" });
          return;
        } else {
          try {
            const userId = await query(
              `SELECT users.id, profile_picture_url FROM users INNER JOIN consultants ON consultants.user_id = users.id WHERE email = '${req.user.email}'`
            );
            console.log("userId: ", userId);
            if (
              userId[0].profile_picture_url ===
              "/images/default-profile-picture.png"
            ) {
              await query(
                `UPDATE consultants SET profile_picture_url = '/images/${req.user.email}/profile-picture.jpg' WHERE user_id = ${userId[0].id}`
              );
              res
                .status(200)
                .json({ data: "consultant profile pic url updated" });
              return;
            }
          } catch (err) {
            res.status(500).json({ error: "db error" });
            return;
          }
          res.status(200).json({ data: "success" });
        }
      }
    );
});

export default apiRoute;

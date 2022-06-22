//import query from "../../db";
const admin = require("../../../../fbAdmin.config");
import multer from "multer";
import nextConnect from "next-connect";
//import formidable from "formidable";
import sharp from "sharp";
var fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};

// var storage = multer.diskStorage({
//   destination: "./public/images/sample",
//   filename: function (req, file, cb) {
//     cb(null, "profile-pic.jpg");
//   },
// });

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
    .toFile(`./public/images/${req.user.email}/profile-picture.jpg`, (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "resizing image error" });
      } else res.status(200).json({ data: "success" });
    });
});

// async function profilePictureUpload(req, res) {
//   //console.log("request: ", req);
//   try {
//     const firebaseUser = await admin.auth().verifyIdToken(req.cookies.idToken);

//     req.user = firebaseUser;
//   } catch (err) {
//     res.status(401).json({ err: "invalid or expired token" });
//     return;
//   }

// const form = new formidable.IncomingForm({
//   uploadDir: "./public/images/sample",
//   keepExtensions: true,
//   filename: "profile-picture",
// });
// form.uploadDir = "./public/images/sample";
// form.keepExtensions = true;
// form.filename = "profile-picture";
//   form.parse(req, (err, fields, files) => {
//     console.log(err, fields, files);
//   });
//   res.status(200).send({});
// }

// export default profilePictureUpload;
export default apiRoute;

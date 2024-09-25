const multer = require("multer");
const jwt = require("jsonwebtoken");
const userSchema = require("../ModelViewController/Model/userSchema");

storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const token = req.params.id;
    const decodedUserId = jwt.verify(token, process.env.JWT_SECRET_KEY);
    cb(null, `Storage/${decodedUserId.id.id}/Images/`);
  },

  filename: async function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `SAM_${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith("image") ? cb(null, true) : cb("wrong type", false);
};

// Create upload instance for single file
const upload = multer({ storage: storage, fileFilter: multerFilter }).single(
  "photo"
);

exports.uploadUserPhoto = upload;

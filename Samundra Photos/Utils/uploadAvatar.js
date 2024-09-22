const multer = require("multer");

storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    //cb means Call Back function
    if (!req.user) {
      return console.log("No user exits");
    }
    cb("null", `Storage/${req.user.id}/Images/`);
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

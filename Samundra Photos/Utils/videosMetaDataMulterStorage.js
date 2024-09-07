const multer = require("multer");

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb means Call Back function
    cb(null, "Storage/Videos/");
  },

  filename: async function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `SAM_${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith("video") ? cb(null, true) : cb("wrong type", false);
};

const upload = multer({ storage: storage, fileFilter: multerFilter }).array(
  "files",
  5
);

// Middleware to handle file count
exports.videoUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (req.files.length > 4) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Too much files upload at once" });
    } else if (req.files.length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to upload video data " + err,
      });
    }

    next();
  });
};

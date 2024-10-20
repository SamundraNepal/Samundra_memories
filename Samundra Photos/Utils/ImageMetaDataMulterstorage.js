const multer = require('multer');

storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    //cb means Call Back function
    cb(null, `Storage/${req.user.id}/Images/`);
  },

  filename: async function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    cb(null, `SAM_${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith('image') ? cb(null, true) : cb('wrong type', false);
};

const upload = multer({ storage: storage, fileFilter: multerFilter }).array(
  'files',
  50
);

// Middleware to handle file count
exports.imageUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (req.files.length > 50) {
      return res
        .status(400)
        .json({ status: 'Failed', message: 'Too much files upload at once' });
    } else if (req.files.length === 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Failed to create image data ' + err,
      });
    }

    next();
  });
};

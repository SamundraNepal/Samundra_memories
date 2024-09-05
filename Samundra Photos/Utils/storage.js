const multer = require("multer");


storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb means Call Back function
    cb(null, "Storage/Images/");
  },

  filename: async function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith("image") ? cb(null, true) : cb("wrong type", false);
};

const upload = multer({ storage: storage, fileFilter: multerFilter }).array(
  "files",
  5
);

// Middleware to handle file count
exports.imageUpload = (req, res, next) => {
    
  upload(req, res, (err) => {
    
    if (req.files.length > 4) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Too much files upload at once" });
    } else if (req.files.length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to create image data " + err,
      });
    }

    next();
  });

 /*
    try {
        new ExifImage({ image : 'myImage.jpg' }, function (error, exifData) {
            if (error)
                console.log('Error: '+error.message);
            else
                console.log(exifData); // Do something with your data!
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
*/
  
};

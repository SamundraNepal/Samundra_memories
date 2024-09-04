const imageModel = require("../Model/imageSchema");

exports.createImage = async (req, res) => {
  try {
    const imagePromiseResolve = req.files.map(async (file) => {
      return await imageModel.create({
        imageName: file.filename,
        imageStorage: file.destination,
        imageUrl: `${req.protocol}://${req.get("host")}/${file.destination}/${
          file.filename
        }`,
      });
    });

    const imageDetails = await Promise.all(imagePromiseResolve);

    res.status(200).json({
      status: "Success",
      message: "Image Data created",
      imageType: {
        data: imageDetails,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: "Failed to create image data " + err.message,
    });
  }
};

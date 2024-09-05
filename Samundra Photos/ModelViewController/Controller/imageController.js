const { model } = require("mongoose");
const imageModel = require("../Model/imageSchema");
const ExifReader = require("exifreader");

const readPhotoData = async function (req) {
  const tags = req.files.map(async (file) => {
    return await ExifReader.load(file.path);
  });
  return (exifFiles = await Promise.all(tags));
};

const readImageMetaData = async function (req) {
  const tag = await readPhotoData(req);

  const properties = tag.map((el) => ({
    Make: el.Make,
    Model: el.Model,
    DateTimeOriginal: el.DateTimeOriginal,
    OffsetTime: el.OffsetTime,
    PixelXDimension: el.PixelXDimension,
    PixelYDimension: el.PixelYDimension,
    GPSLatitudeRef: el.GPSLatitudeRef,
    GPSLatitude: el.GPSLatitude,
    GPSLongitudeRef: el.GPSLongitudeRef,
    GPSLongitude: el.GPSLongitude,
    GPSAltitudeRef: el.GPSAltitudeRef,
    GPSAltitude: el.GPSAltitude,
  }));

  return properties;
};

exports.createImage = async (req, res) => {
  try {
    const imageMetaData = await readImageMetaData(req);

    const imageDataProcessing = req.files.map(async (file) => {
      return {
        imageName: file.filename,
        imageURL: `${req.protocol}://${req.get("host")}/${file.destination}/${
          file.filename
        }`,
      };
    });

    const imageMeteDataProcessing = imageMetaData.map(async (metaData) => {
      return {
        make: metaData.Make.description,
        model: metaData.Model.description,
        dateTimeOriginal: metaData.DateTimeOriginal.description,
        offsetTime: metaData.OffsetTime.description,

        pixelXDimension: metaData.PixelXDimension.description,
        pixelYDimension: metaData.PixelYDimension.description,

        gPSLatitudeRef: metaData.GPSLatitudeRef.description,
        gPSLatitude: metaData.GPSLatitude.value,

        gPSLongitudeRef: metaData.GPSLongitudeRef.description,
        gPSLongitude: metaData.GPSLongitude.value,

        gPSAltitudeRef: metaData.GPSAltitudeRef.description,
        gPSAltitude: metaData.GPSAltitude.value,
      };
    });

    //wait for all the promises
    const imageDataProcesssed = await Promise.all(imageDataProcessing);
    const imageMetaDataProcesssed = await Promise.all(imageMeteDataProcessing);

    // Combine the data
    const combinedData = imageDataProcesssed.map((image, index) => ({
      ...image,
      ...imageMetaDataProcesssed[index],
    }));

    // Database Created
    const createData = await imageModel.create(combinedData);

    res.status(200).json({
      status: "Success",
      message: "Image Data created",
      imageType: {
        data: createData,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: "Failed to create image data " + err.message,
    });
  }
};

exports.getAllImage = async (req, res) => {
  try {
    const imagedata = await imageModel.find();
    res.status(200).json({
      status: "Success",
      result: imagedata.length,
      datas: { imagedata },
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: "Failed to get the data " + err.message,
    });
  }
};

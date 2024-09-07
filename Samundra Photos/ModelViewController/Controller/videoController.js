const { exiftool } = require("exiftool-vendored");
const video_Schema = require("../Model/videosSchema");
const resHandler = require("../../Utils/Error Handler/errorHandler");
const fs = require("fs");

const getVideoMetaData = async function (req) {
  const readVideoMetaData = req.files.map(async (metadata) => {
    return await exiftool.read(metadata.path);
  });
  const data = await Promise.all(readVideoMetaData);
  return data;
};

const readVideoMetaData = async function (req) {
  const videoMetaData = await getVideoMetaData(req);
  const processingVideoMetaData = videoMetaData.map(async (data) => ({
    make: data?.AndroidModel,
    videoDuration: data?.Duration,
    dateTimeOriginal: data.CreateDate?.rawValue,
    videoWidthAndHeight: data?.ImageSize,
    videoMegaPixels: data?.Megapixels,
    videoTakenPlace: data.CreateDate?.zoneName,
    gPSLatitudeAndLongitude: data?.GPSCoordinates,
  }));

  const imageDataProcessing = req.files.map(async (file) => {
    return {
      viodeoName: file.filename,
      videoFileSize: file.size,
      videoURL: `${req.protocol}://${req.get("host")}/${file.destination}/${
        file.filename
      }`,
    };
  });

  const processedImageData = await Promise.all(imageDataProcessing);

  const processedVideoMetaData = await Promise.all(processingVideoMetaData);

  return (combinedData = processedImageData.map((imageData, index) => ({
    ...imageData,
    ...processedVideoMetaData[index],
  })));
};

exports.createVideo = async (req, res) => {
  try {
    const videoMetaData = await readVideoMetaData(req);
    const createData = await video_Schema.create(videoMetaData);
    resHandler(res, 200, "Success", createData);
  } catch (err) {
    resHandler(res, 400, "Success", "Failed to create video " + err.message);
  }
};

exports.getAllVideo = async (req, res) => {
  try {
    const videodata = await video_Schema.find({ isActive: true });
    if (videodata.length < 1) {
      return resHandler(res, 200, "Success", "No data avaliable");
    }
    resHandler(res, 200, "Success", {
      total: videodata.length,
      result: videodata,
    });
  } catch (err) {
    resHandler(res, 400, "Failed", "Failed to get the data");
  }
};

exports.softDeleteVideo = async (req, res) => {
  try {
    // Check if videoId is provided
    const videoId = req.params.id;
    if (videoId.length < 12) {
      return resHandler(res, 400, "Failed", "Video ID is required");
    }

    const deletevideoId = await video_Schema.findByIdAndUpdate(videoId, {
      isActive: false,
    });

    if (!deletevideoId) {
      return resHandler(res, 400, "Failed", "ID does not exits");
    }

    return resHandler(res, 200, "Success", "Video ID is deleted");
  } catch (err) {
    res
      .status(400)
      .json({ status: "Failed", message: "Failed to delete the Video" });
  }
};

exports.hardDeleteVideo = async (req, res) => {
  try {
    const videoID = req.params.id;
    if (!videoID) {
      return resHandler(res, 400, "Failed", "Video ID is required");
    }
    const deleteVideoId = await video_Schema.findByIdAndDelete(videoID);

    if (!deleteVideoId) {
      return resHandler(res, 400, "Failed", "Video does not exits");
    }

    //to delete files from the database

    fs.unlink(`Storage/Videos/${deleteVideoId.viodeoName}`, (err) => {
      if (err) {
        console.log("Video file is not deleted " + err);
      } else {
        console.log("Video file is deleted");
      }
    });
    resHandler(
      res,
      200,
      "Success",
      "Video MetaData + Video Files is permanently deleted"
    );
  } catch (err) {
    resHandler(res, 400, "Failed", "Failed to delete the Video " + err.message);
  }
};

exports.restoreVideo = async (req, res) => {
  try {
    const videoID = req.params.id;

    if (videoID.length < 12) {
      return resHandler(res, 400, "Failed", "Video ID is required");
    }

    const deletevideoID = await video_Schema.findByIdAndUpdate(videoID, {
      isActive: true,
    });

    if (!deletevideoID) {
      return resHandler(res, 400, "Failed", "ID does not exits");
    }
    resHandler(res, 200, "Success", "Video ID is restored");
  } catch (err) {
    resHandler(res, 400, "Failed", "Video ID is not restore " + err.message);
  }
};

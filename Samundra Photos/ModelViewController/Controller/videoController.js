const { exiftool } = require('exiftool-vendored');
const video_Schema = require('../Model/videosSchema');
const resHandler = require('../../Utils/Error Handler/errorHandler');
const fs = require('fs');
const { format } = require('express/lib/response');

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

    dateTimeOriginal:
      data.CreateDate?.rawValue &&
      new Date(
        data.CreateDate?.rawValue.slice(0, 10).replace(/:/g, '-') +
          data.CreateDate?.rawValue.slice(10)
      ).toString(),

    videoWidthAndHeight: data?.ImageSize,
    videoMegaPixels: data?.Megapixels,
    videoTakenPlace: data.CreateDate?.zoneName,
    gPSLatitudeAndLongitude: data?.GPSCoordinates,
  }));

  const videoDataProcessing = req.files.map(async (file) => {
    return {
      viodeoName: file.filename,
      videoFileSize: file.size,
      videoURL: `${req.protocol}://${req.get('host')}/${file.destination}/${
        file.filename
      }`,
      videoAlbums: req.body?.albumName || [],
    };
  });

  const processedvideoData = await Promise.all(videoDataProcessing);

  const processedVideoMetaData = await Promise.all(processingVideoMetaData);

  return (combinedData = processedvideoData.map((videoData, index) => ({
    ...videoData,
    ...processedVideoMetaData[index],
  })));
};

exports.createVideo = async (req, res) => {
  try {
    //creating the image schema based on the user id
    const userRelatedVideoSchema = await video_Schema(req.user.id);
    const videoMetaData = await readVideoMetaData(req);

    const createData = await userRelatedVideoSchema.create(videoMetaData);
    resHandler(res, 200, 'Success', createData);
  } catch (err) {
    resHandler(res, 400, 'Success', 'Failed to create video ' + err.message);
  }
};

exports.getAllVideo = async (req, res) => {
  try {
    const createdUserVideoSchema = await video_Schema(req.user.id);

    const videodata = await createdUserVideoSchema.find({
      isActive: true,
      videoAlbums: { $size: 0 }, // Find documents where photoAlbums is an empty array
    });
    if (videodata.length < 1) {
      return resHandler(res, 200, 'Success', 'No data avaliable');
    }

    const totalSize = videodata.reduce((acc, cur) => {
      return acc + Number(cur.videoFileSize); // Ensure cur.imageSize is a number
    }, 0);

    const stats = await createdUserVideoSchema.aggregate([
      {
        $match: {
          isActive: true,
          videoAlbums: { $size: 0 }, // Find documents where photoAlbums is an empty array
        }, // Filter to only get documents with isActive true
      },
      {
        $addFields: {
          // Use regex to extract the parts needed for a valid ISO date
          parsedDate: {
            $dateFromString: {
              dateString: {
                $substr: [
                  '$dateTimeOriginal',
                  0,
                  24, // Extract the first 24 characters (this should cover "Thu Sep 19 2024 21:58:44")
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            // Format the date as YYYY-MM-DD for grouping
            $dateToString: { format: '%Y-%m-%d', date: '$parsedDate' },
          },
          fileDatas: { $push: '$$ROOT' }, // Group items with the same date
        },
      },
      {
        $sort: { _id: -1 }, // Sort by _id (which is dateOnly) in descending order
      },
    ]);

    resHandler(res, 200, 'Success', {
      total: videodata.length,
      result: stats,
      totalSize,
    });
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to get the data');
  }
};

exports.softDeleteVideo = async (req, res) => {
  try {
    const createdUserVideoSchema = await video_Schema(req.user.id);

    // Check if videoId is provided
    const videoId = req.params.id;
    if (videoId.length < 12) {
      return resHandler(res, 400, 'Failed', 'Video ID is required');
    }

    const deletevideoId = await createdUserVideoSchema.findByIdAndUpdate(
      videoId,
      {
        isActive: false,
        $set: { videoAlbums: [] },
      }
    );

    if (!deletevideoId) {
      return resHandler(res, 400, 'Failed', 'ID does not exits');
    }

    return resHandler(res, 200, 'Success', 'Video ID is deleted');
  } catch (err) {
    res
      .status(400)
      .json({ status: 'Failed', message: 'Failed to delete the Video' });
  }
};

exports.getSoftDeletedVideos = async (req, res) => {
  try {
    const createdUserVideoSchema = video_Schema(req.user.id);

    const deleteVideos = await createdUserVideoSchema.find({
      isActive: false,
    });

    if (!deleteVideos) {
      return resHandler(res, 400, 'Failed', 'Videos does not exits');
    }

    const totalSize = deleteVideos.reduce((acc, cur) => {
      return acc + Number(cur.videoFileSize);
    }, 0);
    resHandler(res, 200, 'Success', {
      message: 'Image deleted',
      deleteVideos,
      totalSize,
    });
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to get deleted Videos');
  }
};

exports.hardDeleteVideo = async (req, res) => {
  try {
    const createdUserVideoSchema = await video_Schema(req.user.id);

    const videoID = req.params.id;
    if (!videoID) {
      return resHandler(res, 400, 'Failed', 'Video ID is required');
    }
    const deleteVideoId = await createdUserVideoSchema.findByIdAndDelete(
      videoID
    );

    if (!deleteVideoId) {
      return resHandler(res, 400, 'Failed', 'Video does not exits');
    }

    //to delete files from the database

    fs.unlink(
      `Storage/${req.user.id}/Videos/${deleteVideoId.viodeoName}`,
      (err) => {
        if (err) {
          console.log('Video file is not deleted ' + err);
        } else {
          console.log('Video file is deleted');
        }
      }
    );
    resHandler(
      res,
      200,
      'Success',
      'Video MetaData + Video Files is permanently deleted'
    );
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to delete the Video ' + err.message);
  }
};

exports.restoreVideo = async (req, res) => {
  try {
    const createdUserVideoSchema = await video_Schema(req.user.id);

    const videoID = req.params.id;

    if (videoID.length < 12) {
      return resHandler(res, 400, 'Failed', 'Video ID is required');
    }

    const deletevideoID = await createdUserVideoSchema.findByIdAndUpdate(
      videoID,
      {
        isActive: true,
      }
    );

    if (!deletevideoID) {
      return resHandler(res, 400, 'Failed', 'ID does not exits');
    }
    resHandler(res, 200, 'Success', 'Video ID is restored');
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Video ID is not restore ' + err.message);
  }
};

//Album handler
exports.getAlbumVideo = async (req, res) => {
  try {
    const createdUserVideoSchema = await video_Schema(req.user.id);

    const videoData = await createdUserVideoSchema.find({
      isActive: true,
      videoAlbums: req.body.albumName,
    });

    if (videoData.length <= 0) {
      return resHandler(res, 200, 'Success', 'No data avaliable');
    }

    // Corrected reduce function
    const totalSize = videoData.reduce((acc, cur) => {
      return acc + Number(cur.imageSize); // Ensure cur.imageSize is a number
    }, 0);

    const stats = await createdUserVideoSchema.aggregate([
      {
        $match: { isActive: true, videoAlbums: req.body.albumName }, // Filter to only get documents with isActive true
      },
      {
        $addFields: {
          // Use regex to extract the parts needed for a valid ISO date
          parsedDate: {
            $dateFromString: {
              dateString: {
                $substr: [
                  '$dateTimeOriginal',
                  0,
                  24, // Extract the first 24 characters (this should cover "Thu Sep 19 2024 21:58:44")
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            // Format the date as YYYY-MM-DD for grouping
            $dateToString: { format: '%Y-%m-%d', date: '$parsedDate' },
          },
          fileDatas: { $push: '$$ROOT' }, // Group items with the same date
        },
      },
      {
        $sort: { _id: -1 }, // Sort by _id (which is dateOnly) in descending order
      },
    ]);

    resHandler(res, 200, 'Success', {
      total: videoData.length,
      result: stats,
      totalSize,
    });
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to get image metadata ' + err.message
    );
  }
};

//add videos to album

exports.addVideoToAlbum = async (req, res) => {
  try {
    const AlbumName = req.body.imageToAlbumName;
    const id = req.params.id;
    const createdVideoSchema = video_Schema(req.user.id);

    const imagedata = await createdVideoSchema.updateMany(
      {
        _id: id,
        videoAlbums: { $size: 0 },
      },
      {
        $set: { videoAlbums: AlbumName }, // Correct syntax for $set
      }
    );

    if (!imagedata) {
      return resHandler(res, 400, 'failed', 'Already in album');
    }

    resHandler(res, 200, 'Success', {
      result: `${id} have been updated to ${AlbumName}`,
    });
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to add to the album    ' + err.message
    );
  }
};

//remove videos from the album
exports.removeVideosFromAlbum = async (req, res) => {
  try {
    const id = req.params.id;
    const createdUserVideoSchema = video_Schema(req.user.id);

    const imagedata = await createdUserVideoSchema.updateMany(
      {
        _id: id,
      },
      {
        $set: { videoAlbums: [] }, // Correct syntax for $set
      }
    );

    if (!imagedata) {
      return resHandler(res, 400, 'failed', 'Already in album ');
    }

    resHandler(res, 200, 'Success', {
      result: `${id} have been removed`,
    });
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to remove to the album    ' + err.message
    );
  }
};

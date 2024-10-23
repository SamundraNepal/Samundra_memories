const imageModel = require('../Model/imageSchema');
const ExifReader = require('exifreader');
const resHandler = require('../../Utils/Error Handler/errorHandler');
const fs = require('fs');

const readPhotoData = async function (req) {
  const tags = req.files.map(async (file) => {
    return await ExifReader.load(file.path);
  });
  return (exifFiles = await Promise.all(tags));
};

const readImageMetaData = async function (req) {
  const tag = await readPhotoData(req);

  const imageMetaDataProcesssing = tag.map(async (metaData) => ({
    make: metaData.Make?.description,
    model: metaData.Model?.description,

    dateTimeOriginal:
      metaData.DateTimeOriginal?.description &&
      new Date(
        metaData.DateTimeOriginal.description.slice(0, 10).replace(/:/g, '-') +
          metaData.DateTimeOriginal.description.slice(10)
      ).toString(),

    offsetTime: metaData.OffsetTime?.description,

    pixelXDimension: metaData.PixelXDimension?.description,
    pixelYDimension: metaData.PixelYDimension?.description,

    gPSLatitudeRef: metaData.GPSLatitudeRef?.description,
    gPSLatitude: metaData.GPSLatitude?.value,

    gPSLongitudeRef: metaData.GPSLongitudeRef?.description,
    gPSLongitude: metaData.GPSLongitude?.value,

    gPSAltitudeRef: metaData.GPSAltitudeRef?.description,
    gPSAltitude: metaData.GPSAltitude?.value,
  }));

  const imageDataProcessing = req.files.map(async (file) => {
    return {
      imageName: file.filename,
      imageSize: file.size,
      imageURL: `${req.protocol}://${req.get('host')}/${file.destination}/${
        file.filename
      }`,
    };
  });

  //wait for all the promises
  const imageDataProcesssed = await Promise.all(imageDataProcessing);
  const imageMetaDataProcesssed = await Promise.all(imageMetaDataProcesssing);
  // Combine the data
  return (combinedData = imageDataProcesssed.map((image, index) => ({
    ...image,
    ...imageMetaDataProcesssed[index],
  })));
};

exports.createImage = async (req, res) => {
  try {
    //gets the processed data from the reqs
    const imageMetaData = await readImageMetaData(req);

    //creating the image schema based on the user id
    const userRelatedImageSchema = await imageModel(req.user.id);

    // Database Created
    const createData = await userRelatedImageSchema.create(imageMetaData);
    resHandler(res, 200, 'Success', { result: createData });
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to upload image ' + err.message);
  }
};

exports.getAllImage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const createdUserImageSchema = imageModel(req.user.id);

    const imagedata = await createdUserImageSchema.find({ isActive: true });

    if (imagedata.length < 1) {
      return resHandler(res, 200, 'Success', 'No data avaliable');
    }

    // Corrected reduce function
    const totalSize = imagedata.reduce((acc, cur) => {
      return acc + Number(cur.imageSize); // Ensure cur.imageSize is a number
    }, 0);

    const stats = await createdUserImageSchema.aggregate([
      {
        $match: { isActive: true }, // Filter to only get documents with isactive true
      },
      {
        $addFields: {
          dateOnly: { $substr: ['$dateTimeOriginal', 0, 15] },
        },
      },
      {
        $group: {
          _id: '$dateOnly',
          fileDatas: { $push: '$$ROOT' }, // Group items with the same date
        },
      },
      {
        $sort: { _id: -1 }, // Sort by _id (which is dateOnly) in descending order
      },
    ]);

    resHandler(res, 200, 'Success', {
      total: imagedata.length,
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

exports.softDeleteImage = async (req, res) => {
  try {
    const createdUserImageSchema = imageModel(req.user.id);

    const imageId = req.params.id;

    if (!imageId) {
      return resHandler(res, 400, 'Failed', 'Image ID is required');
    }

    const deleteImageId = await createdUserImageSchema.findByIdAndUpdate(
      imageId,
      {
        isActive: false,
      }
    );

    if (!deleteImageId) {
      return resHandler(res, 400, 'Failed', 'ID does not exits');
    }
    resHandler(res, 200, 'Success', 'Image is deleted');
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to delete the image');
  }
};

exports.getSoftDeletedImages = async (req, res) => {
  try {
    const createdUserImageSchema = imageModel(req.user.id);

    const deleteImages = await createdUserImageSchema.find({
      isActive: false,
    });

    if (!deleteImages) {
      return resHandler(res, 400, 'Failed', 'Images does not exits');
    }

    const totalSize = deleteImages.reduce((acc, cur) => {
      return acc + Number(cur.imageSize);
    }, 0);
    resHandler(res, 200, 'Success', {
      message: 'Image deleted',
      deleteImages,
      totalSize,
    });
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to get deleted images');
  }
};

exports.hardDeleteImage = async (req, res) => {
  try {
    const createdUserImageSchema = imageModel(req.user.id);
    const imageId = req.params.id;
    if (!imageId) {
      return resHandler(res, 400, 'Failed', 'Image ID is required');
    }
    const deleteImageId = await createdUserImageSchema.findByIdAndDelete(
      imageId
    );

    if (!deleteImageId) {
      return resHandler(res, 400, 'Failed', 'Image does not exits');
    }

    //to delete files from the database

    fs.unlink(
      `Storage/${req.user.id}/Images/${deleteImageId.imageName}`,
      (err) => {
        if (err) {
          console.log('Image file is not deleted ' + err.message);
        } else {
          console.log('Image file is deleted');
        }
      }
    );
    resHandler(
      res,
      200,
      'Success',
      'Image MetaData + Image Files is permanently deleted'
    );
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to delete the image');
  }
};

exports.restoreImage = async (req, res) => {
  try {
    const createdUserImageSchema = imageModel(req.user.id);
    const imageId = req.params.id;
    if (!imageId) {
      resHandler(res, 400, 'Failed', 'Invalid id');
    }
    const deleteImageId = await createdUserImageSchema.findByIdAndUpdate(
      imageId,
      {
        isActive: true,
      }
    );

    if (!deleteImageId) {
      resHandler(res, 400, 'Failed', 'Image does not exits');
    }
    resHandler(res, 200, 'Success', 'Image is restored');
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to restore the image');
  }
};

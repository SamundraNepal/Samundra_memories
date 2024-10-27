const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const image_Schema = new mongoose.Schema({
  imageName: { type: String, default: 'Memoreis' },
  imageURL: { type: String, default: 'missing' },
  imageBase64: { type: String, default: null },
  imageSize: { type: String },

  backUpDate: { type: String, default: new Date() },

  make: { type: String, default: 'Memoreis.SAM' },
  model: { type: String, default: 'Memories.SAM_V1.0' },

  dateTimeOriginal: { type: String, default: new Date() },
  offsetTime: { type: String, default: 'Memories' },

  pixelXDimension: { type: String, default: 'Missing' },
  pixelYDimension: { type: String, default: 'Missing' },

  gPSLatitudeRef: { type: String, default: 'Missing' },
  gPSLatitude: { type: [[String]], default: ['00000S', '00000N'] },

  gPSLongitudeRef: { type: String, default: 'Missing' },
  gPSLongitude: { type: [[String]], default: ['00000S', '00000N'] },

  gPSAltitudeRef: { type: String, default: 'Missing' },
  gPSAltitude: { type: [[String]], default: ['0000', '0000'] },

  isActive: { type: Boolean, default: true },
});

image_Schema.pre('save', function (next) {
  this.imageSize = (parseFloat(this.imageSize / 1024) / 1024).toFixed(2);

  next();
});

const imageModel = function (userId) {
  return mongoose.model(`image_schema/${userId}`, image_Schema);
};

module.exports = imageModel;

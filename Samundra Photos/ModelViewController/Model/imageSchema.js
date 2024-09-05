const mongoose = require("mongoose");

const image_Schema = new mongoose.Schema({
  imageName: { type: String, default: "Memoreis" },
  imageURL: { type: String, default: "missing" },

  backUpDate: { type: String, default: new Date().toISOString() },

  make: { type: String, default: "Memoreis" },
  model: { type: String, default: "Memories" },

  dateTimeOriginal: { type: String, default: Date.now },
  offsetTime: { type: String, default: "Memories" },

  pixelXDimension: { type: String, default: "Missing" },
  pixelYDimension: { type: String, default: "Missing" },

  gPSLatitudeRef: { type: String, default: "Missing" },
  gPSLatitude: { type: [[String]], default: ["00000S", "00000N"] },

  gPSLongitudeRef: { type: String, default: "Missing" },
  gPSLongitude: { type: [[String]], default: ["00000S", "00000N"] },

  gPSAltitudeRef: { type: String, default: "Missing" },
  gPSAltitude: { type: [[String]], default: ["0000", "0000"] },
});

const imageModel = mongoose.model("imageModel", image_Schema);

module.exports = imageModel;

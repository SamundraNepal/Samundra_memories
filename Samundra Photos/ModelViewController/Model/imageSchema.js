const mongoose = require("mongoose");

const image_Schema = new mongoose.Schema({
  imageName: {
    type: String,
    unique: true,
  },

  imageDescription: {
    type: String,
    default: "image",
  },

  imageDate: {
    type: String,
    default: Date.now,
  },

  imageCordinates: {
    type: [String],
    default: ["000000000", "0000000"],
  },

  imageStorage: {
    type: String,
    default: "Server",
  },

  imageUrl: {
    type: String,
    default: "missing",
  },
});

const imageModel = mongoose.model("imageModel", image_Schema);

module.exports = imageModel;

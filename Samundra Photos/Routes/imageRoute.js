const express = require("express");
const router = express.Router();


//Inheritance
const uploadImage = require("../Utils/ImageMetaDataMulterstorage");
const imageController = require("../ModelViewController/Controller/imageController");

router
  .route("/upload")
  .post(uploadImage.imageUpload, imageController.createImage);

  router.route('/images').get(imageController.getAllImage);

  router.route('/deleteImage/:id').patch(imageController.deleteImage);

module.exports = router;

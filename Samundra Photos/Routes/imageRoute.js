const express = require("express");
const router = express.Router();

//Inheritance
const uploadImage = require("../Utils/ImageMetaDataMulterstorage");
const imageController = require("../ModelViewController/Controller/imageController");

router
  .route("/upload")
  .post(uploadImage.imageUpload, imageController.createImage);

router.route("/images").get(imageController.getAllImage);

router.route("/deleteImage/:id").patch(imageController.softDeleteImage);

router.route("/restoreImage/:id").patch(imageController.restoreImage);

router.route("/hardDeleteImage/:id").delete(imageController.hardDeleteImage);

module.exports = router;

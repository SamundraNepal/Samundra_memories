const express = require("express");
const router = express.Router();

//Inheritance
const uploadImage = require("../Utils/ImageMetaDataMulterstorage");
const imageController = require("../ModelViewController/Controller/imageController");
const authController = require("../ModelViewController/Controller/authController");

router
  .route("/upload")
  .post(
    authController.protect,
    uploadImage.imageUpload,
    imageController.createImage
  );

router
  .route("/images")
  .get(authController.protect, imageController.getAllImage);

router
  .route("/deleteImage/:id")
  .patch(authController.protect, imageController.softDeleteImage);

router
  .route("/restoreImage/:id")
  .patch(authController.protect, imageController.restoreImage);

router
  .route("/hardDeleteImage/:id")
  .delete(authController.protect, imageController.hardDeleteImage);

module.exports = router;

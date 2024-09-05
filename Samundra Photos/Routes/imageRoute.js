const express = require("express");
const router = express.Router();
const multer = require("multer");

//Inheritance
const uploadImage = require("../Utils/storage");
const imageController = require("../ModelViewController/Controller/imageController");

router
  .route("/upload")
  .post(uploadImage.imageUpload, imageController.createImage);

  router.route('/images').get(imageController.getAllImage);

module.exports = router;

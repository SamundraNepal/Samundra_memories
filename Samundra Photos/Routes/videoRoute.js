const express = require("express");
const router = express.Router();

//inHeritance
const uploadVideo = require("../Utils/videosMetaDataMulterStorage");
const videoController = require("../ModelViewController/Controller/videoController");
const authController = require('../ModelViewController/Controller/authController');

router
  .route("/upload")
  .post(authController.protect,uploadVideo.videoUpload, videoController.createVideo);

router.route("/videos").get(authController.protect,videoController.getAllVideo);

router.route("/deleteVideo/:id").patch(authController.protect,videoController.softDeleteVideo);

router.route("/restoreVideo/:id").patch(authController.protect,videoController.restoreVideo);

router.route("/hardDeleteVideo/:id").delete(authController.protect,videoController.hardDeleteVideo);

module.exports = router;

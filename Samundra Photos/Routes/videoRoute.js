const express = require("express");
const router = express.Router();

//inHeritance
const uploadVideo = require("../Utils/videosMetaDataMulterStorage");
const videoController = require("../ModelViewController/Controller/videoController");

router
  .route("/upload")
  .post(uploadVideo.videoUpload, videoController.createVideo);

router.route("/videos").get(videoController.getAllVideo);

router.route("/deleteVideo/:id").patch(videoController.softDeleteVideo);

router.route("/restoreVideo/:id").patch(videoController.restoreVideo);

router.route("/hardDeleteVideo/:id").delete(videoController.hardDeleteVideo);

module.exports = router;

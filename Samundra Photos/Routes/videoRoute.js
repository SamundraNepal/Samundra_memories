const express = require('express');
const router = express.Router();

//inHeritance
const uploadVideo = require('../Utils/videosMetaDataMulterStorage');
const videoController = require('../ModelViewController/Controller/videoController');
const authController = require('../ModelViewController/Controller/authController');

router
  .route('/upload')
  .post(
    authController.protect,
    uploadVideo.videoUpload,
    videoController.createVideo
  );

router
  .route('/videos')
  .get(authController.protect, videoController.getAllVideo);

router
  .route('/deleteVideo/:id')
  .patch(authController.protect, videoController.softDeleteVideo);

router
  .route('/restoreVideo/:id')
  .patch(authController.protect, videoController.restoreVideo);

router
  .route('/trashVideos')
  .get(authController.protect, videoController.getSoftDeletedVideos);

router
  .route('/hardDeleteVideo/:id')
  .delete(authController.protect, videoController.hardDeleteVideo);

//All albums
router
  .route('/albumVideo')
  .post(authController.protect, videoController.getAlbumVideo);

router
  .route('/addVideoToAlbum/:id')
  .patch(authController.protect, videoController.addVideoToAlbum);

router
  .route('/removeVideoFromAlbum/:id')
  .patch(authController.protect, videoController.removeVideosFromAlbum);

module.exports = router;

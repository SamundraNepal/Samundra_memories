const express = require('express');
const router = express.Router();

//Inheritance
const uploadImage = require('../Utils/ImageMetaDataMulterstorage');
const imageController = require('../ModelViewController/Controller/imageController');
const authController = require('../ModelViewController/Controller/authController');

router
  .route('/upload')
  .post(
    authController.protect,
    uploadImage.imageUpload,
    imageController.createImage
  );

router
  .route('/images')
  .get(authController.protect, imageController.getAllImage);

router
  .route('/deleteImage/:id')
  .patch(authController.protect, imageController.softDeleteImage);

router
  .route('/trashImages')
  .get(authController.protect, imageController.getSoftDeletedImages);

router
  .route('/restoreImage/:id')
  .patch(authController.protect, imageController.restoreImage);

router
  .route('/hardDeleteImage/:id')
  .delete(authController.protect, imageController.hardDeleteImage);

//All albums
router
  .route('/albumImage')
  .post(authController.protect, imageController.getAlbumImage);

router
  .route('/addAlbumToImage/:id')
  .patch(authController.protect, imageController.addImageToAlbum);

router
  .route('/removeAlbumToImage/:id')
  .patch(authController.protect, imageController.removeImageFromAlbum);

module.exports = router;

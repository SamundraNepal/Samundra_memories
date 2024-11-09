const express = require('express');
const router = express.Router();

//upload avatar

//inheritance
const authController = require('../ModelViewController/Controller/authController');
const avaterUpload = require('../Utils/uploadAvatar');

router.route('/signUp').post(authController.singUpUser);

router
  .route('/logIn')
  .post(authController.logInUser, authController.verifyUser);

//for single photo upload
router
  .route('/uploadImage/:id')
  .post(avaterUpload.uploadUserPhoto, authController.uploadUserImage);

router
  .route('/user/userData')
  .get(authController.protect, authController.getUserData);

router
  .route('/user/deleteUser')
  .patch(authController.protect, authController.deleteUsers);

router
  .route('/user/updatePassword')
  .post(authController.protect, authController.updatePassword);

router
  .route('/users/admin/approval/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    authController.approveAccount
  );

router
  .route('/users/admin/reject/:id')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    authController.rejectAccount
  );

router
  .route('/users/admin/data')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    authController.getApprovaldata
  );

router.route('/user/forgotPassword').post(authController.forgotPassword);

router.route('/resetPassword/:id').post(authController.resetPassword);

//photo albums
router
  .route('/user/addAlbum/:id')
  .patch(authController.protect, authController.createPhotoAlbum);

router
  .route('/user/updateAlbum/photo')
  .patch(authController.protect, authController.updatePhotoAlbum);

router
  .route('/user/deleteAlbum/photo')
  .patch(authController.protect, authController.deletePhotoAlbum);

//video album
router
  .route('/user/updateAlbum/video')
  .patch(authController.protect, authController.updateVideoAlbum);

router
  .route('/user/deleteAlbum/video')
  .patch(authController.protect, authController.deleteVideoAlbum);

router
  .route('/user/album/addAlbumPassword')
  .post(authController.protect, authController.addAlbumPassword);

router
  .route('/user/album/openAlbumLocked')
  .post(authController.protect, authController.albumLogIn);

router
  .route('/user/album/RemoveAlbumLocked')
  .patch(authController.protect, authController.albumPasswordRemoval);

module.exports = router;

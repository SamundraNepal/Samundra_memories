const express = require("express");
const router = express.Router();

//upload avatar

//inheritance
const authController = require("../ModelViewController/Controller/authController");
const avaterUpload = require("../Utils/uploadAvatar");

router.route("/signUp").post(authController.singUpUser);

router
  .route("/logIn")
  .post(authController.logInUser, authController.verifyUser);

  //for single photo upload
router
  .route("/uploadImage/:id")
  .post(avaterUpload.uploadUserPhoto , authController.uploadUserImage);

router
  .route("/user/userData")
  .get(authController.protect, authController.getUserData);

router
  .route("/user/deleteUser")
  .patch(authController.protect, authController.deleteUsers);

router
  .route("/user/updatePassword")
  .post(authController.protect, authController.updatePassword);

router
  .route("/users/admin/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    authController.approveAccount
  );

router.route("/user/forgotPassword").post(authController.forgotPassword);

router.route("/resetPassword/:id").post(authController.resetPassword);

module.exports = router;

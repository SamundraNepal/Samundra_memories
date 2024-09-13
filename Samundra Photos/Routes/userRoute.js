const express = require("express");
const router = express.Router();

//inheritance

const authController = require("../ModelViewController/Controller/authController");

router.route("/signUp").post(authController.singUpUser);

router.route("/logIn").post(authController.logInUser);

router.route("/user/deleteUser").patch(authController.protect,authController.deleteUsers);

router.route('/user/updatePassword').post(authController.protect , authController.updatePassword);

router.route('/users/admin/:id').patch(authController.protect,authController.restrictTo('admin') , authController.approveAccount);

router.route('/user/forgotPassword').post(authController.forgotPassword);

router.route('/resetPassword/:id').post(authController.resetPassword);

module.exports = router;

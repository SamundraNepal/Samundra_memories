const express = require('express');
const router = express.Router();

//inheritance

const authController = require('../ModelViewController/Controller/authController');

router.route('/signUp').post(authController.singUpUser);

router.route('/logIn').post(authController.logInUser);



module.exports = router;
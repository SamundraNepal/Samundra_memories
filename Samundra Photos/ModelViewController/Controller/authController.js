const userSchema = require('../Model/userSchema');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');

//inheritance
const sendEmail = require('../../Utils/emailHandler');
const resHandler = require('../../Utils/Error Handler/errorHandler');

const createToken = function (id) {
  return (token = jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1h',
  }));
};

//in the future add account delete method
const test = async function () {
  await fs.promises.rm('Storage/66e3a68e0e5892da760b6671', {
    recursive: true,
    force: true,
  });
};

const createUserFolder = async function (data) {
  const storageFolder = 'Storage';
  const userFolder = path.join(storageFolder, data);
  const imageFolder = path.join(userFolder, 'Images');
  const videoFolder = path.join(userFolder, 'Videos');

  try {
    await fs.promises.mkdir(imageFolder, { recursive: true });
    await fs.promises.mkdir(videoFolder, { recursive: true });
    console.log('Folder is created');
  } catch (err) {
    console.log(err.message);
  }
};

exports.singUpUser = async (req, res, next) => {
  const userData = req.body;
  try {
    // Check if email is provided
    if (!userData.email) {
      return resHandler(res, 400, 'Failed', 'Email is required');
    }
    if (userData.password.length < 8) {
      return resHandler(
        res,
        400,
        'Failed',
        'Password must be greater than 8 characters long'
      );
    }

    const hasUppercase = /[A-Z]/.test(userData.password);
    const hasLowercase = /[a-z]/.test(userData.password);
    const hasNumber = /\d/.test(userData.password);
    const uniqueSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(userData.password);

    if (!hasUppercase) {
      return resHandler(
        res,
        400,
        'Failed',
        'Password must have at least one Uppercase Letter'
      );
    } else if (!hasLowercase) {
      return resHandler(
        res,
        400,
        'Failed',
        'Password must have at least one Lowercase Letter'
      );
    } else if (!hasNumber) {
      return resHandler(
        res,
        400,
        'Failed',
        'Password must have at least one number'
      );
    } else if (!uniqueSymbol) {
      return resHandler(
        res,
        400,
        'Failed',
        'Password must have at least one Unique Symbol'
      );
    }

    if (userData.password != userData.confirmPassword) {
      return resHandler(res, 400, 'Failed', 'Password does not match');
    }

    // Check if user with the same email already exists
    const existingUser = await userSchema.findOne({ email: userData.email });
    if (existingUser) {
      return resHandler(res, 400, 'Failed', 'Email already exists');
    }

    if (userData.adminCode === process.env.SECRET_ADMIN_CODE) {
      userData.role = 'admin';
      console.log('admin is created');
    } else {
      console.log('no match');
    }

    const createUserData = await userSchema.create(userData);

    const token = createToken({ id: createUserData._id });

    if (userData.role !== 'admin') {
      /// notify the admin for account approval
      const approvalURL = `${req.protocol}://${req.get(
        'host'
      )}/v1/memories/users/admin/${createUserData.email}`;
      try {
        await sendEmail({
          to: process.env.HOST_USER_EMAIL,
          subject: 'Account Approval',
          text: `This user email required approval ${createUserData.email} please 
      visit the following link to approve this ${approvalURL}`,
        });
      } catch (err) {
        return resHandler(
          res,
          400,
          'Failed',
          'Failed to notify the admin ' + err.message
        );
      }
    }

    //create indiviual user folder
    await createUserFolder(createUserData.id);

    resHandler(res, 200, 'Success', {
      message: 'Upload image',
      token,
    });

    next();
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to create the user ' + err.message);
  }
};

exports.uploadUserImage = async (req, res) => {
  try {
    const imageFile = req.file;
    const decodedUserId = jwt.verify(req.params.id, process.env.JWT_SECRET_KEY);
    const resizedImagePath = path.join(
      `Storage/${decodedUserId.id.id}/Images`,
      `resized${imageFile.filename}`
    );

    //this will rersize the image
    await sharp(req.file.path)
      .resize(500, 500, { fit: 'fill' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(resizedImagePath);

    // Rename the resized image file to overwrite the original image
    await fs.promises.rename(resizedImagePath, imageFile.path);

    const avatarUrl = `${req.protocol}://${req.get('host')}/${imageFile.path}}`;
    const findUser = await userSchema.findByIdAndUpdate(decodedUserId.id.id, {
      imageLink: avatarUrl,
    });

    await findUser.save({ validateBeforeSave: false });

    resHandler(res, 200, 'Success', {
      message: 'Account Created. Your Account need admin approval',
      findUser,
    });
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to upload user image ' + err.message
    );
  }
};

exports.getApprovaldata = async (req, res) => {
  try {
    const attentionAccount = await userSchema.find({ isApproved: false });

    if (!attentionAccount) {
      return resHandler(res, 200, 'Failed', 'No account to approve');
    }

    return resHandler(res, 200, 'Success', {
      message: 'Following accouts needs approval',
      attentionAccount,
    });
  } catch (err) {
    return resHandler(
      res,
      400,
      'Failed',
      'Failed to get the data ',
      err.message
    );
  }
};

exports.approveAccount = async (req, res) => {
  const approvalEmail = req.body.email;
  try {
    const approveEmail = await userSchema.findOneAndUpdate(
      { email: approvalEmail },
      { isApproved: true }
    );
    if (!approveEmail) {
      return resHandler(res, 400, 'Failed', 'This user does not exits');
    }

    resHandler(
      res,
      200,
      'Success',
      `This email:${approveEmail.email} has been approved`
    );

    try {
      await sendEmail({
        to: approvalEmail,
        subject: 'Account Approved',
        text: 'You account has been approved. You can now log in',
      });
    } catch (err) {
      resHandler(
        res,
        400,
        'Failed',
        'Failed to nofity the user ' + err.message
      );
    }
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to approve account ' + err.message);
  }
};

exports.rejectAccount = async (req, res) => {
  const approvalEmail = req.body.email;
  try {
    const rejectEmail = await userSchema.findOne({ email: approvalEmail });

    if (!rejectEmail) {
      return resHandler(res, 400, 'Failed', 'This user does not exits');
    }

    await fs.promises.rm(`Storage/${rejectEmail.id}`, {
      recursive: true,
      force: true,
    });

    await userSchema.deleteOne({ email: approvalEmail });

    resHandler(
      res,
      200,
      'Success',
      `This email:${rejectEmail.email} has been deleted`
    );

    try {
      await sendEmail({
        to: approvalEmail,
        subject: 'Account Rejected',
        text: 'You account has been Rejected. Please contact the co-operation',
      });
    } catch (err) {
      resHandler(
        res,
        400,
        'Failed',
        'Failed to nofity the user ' + err.message
      );
    }
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to reject the account ' + err.message
    );
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return resHandler(
        res,
        400,
        'Failed',
        'You do not premision to peform this task'
      );
    next();
  };
};

exports.logInUser = async (req, res, next) => {
  const logInUserDetails = req.body;
  try {
    const userLogIn = await userSchema
      .findOne({ email: logInUserDetails.email })
      .select('+password');

    if (!userLogIn)
      return resHandler(res, 400, 'Failed', 'User does not exits');

    if (!userLogIn.isApproved)
      return resHandler(
        res,
        400,
        'Failed',
        'Your account needs admin approval. It will take between 24 to 48 hrs 🫷'
      );

    const isMatched = await userLogIn.passwordMatch(
      logInUserDetails.password,
      userLogIn.password
    );

    // check password
    if (!isMatched) {
      return resHandler(res, 400, 'Failed', 'incorrect password');
    }

    next();
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to get the data ' + err.message);
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const userLogIn = await userSchema.findOne({ email: req.body.email });

    /*// check if the token is still there
    if (userLogIn.oneTimeVerificationTokenExpire != null) {
      if (Date.now() > userLogIn.oneTimeVerificationTokenExpire) {
        userLogIn.oneTimeVerificationToken = null;
        await userLogIn.save({ validateBeforeSave: false });
      } else {
        return resHandler(res, 'Failed', 'Please log in back after 5 mins');
      }
    }*/
    if (!req.body.OTP) {
      //create OTP
      const OTP = userLogIn.createOneTimePasswordVerification();
      await userLogIn.save({ validateBeforeSave: false });
      try {
        await sendEmail({
          to: userLogIn.email,
          subject: 'OTP',
          text: `Your one time password is ${OTP}`,
        });
      } catch (err) {
        return resHandler(
          res,
          400,
          'Failed',
          'Failed to create OTP ' + err.message
        );
      }
      return resHandler(
        res,
        200,
        'Success',
        `A verification code have been sent to your email ${userLogIn.email}`
      );
    }

    const userInputOTP = req.body.OTP.trim();
    //Verify OTP
    try {
      const hashOTP = crypto
        .createHash('sha256')
        .update(userInputOTP)
        .digest('hex');

      // Check if the hashed OTP matches
      if (userLogIn.oneTimeVerificationToken !== hashOTP) {
        return resHandler(res, 400, 'failed', `Invalid OTP`);
      }

      // Check if the OTP is expired
      if (Date.now() > userLogIn.oneTimeVerificationTokenExpire) {
        userLogIn.oneTimeVerificationToken = undefined;
        userLogIn.oneTimeVerificationTokenExpire = undefined;
        await userLogIn.save({ validateBeforeSave: false });

        return resHandler(res, 400, 'failed', 'Expired OTP');
      }
    } catch (err) {
      return resHandler(res, 400, 'failed', 'failed to verify OTP');
    }

    const token = createToken({ id: userLogIn._id });

    if (!userLogIn.isActive) {
      //save the changes
      await userSchema.updateOne(
        { email: userLogIn.email },
        { $set: { isActive: true } }
      );
      return resHandler(res, 200, 'Success', {
        message: 'User account Re-Activated',
        token,
      });
    }

    /*
    // Send JWT token in HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevent access by JavaScript
      secure: false, // Send only over HTTPS (you can use false during development)
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      sameSite: "None", // or 'Lax' based on your needs
    });

    */
    if (userLogIn.role === 'admin')
      return resHandler(res, 200, 'Success', {
        message: 'Admin Logged in',
        token,
        Role: userLogIn.role,
      });

    resHandler(res, 200, 'Success', { message: 'Logged in', token });

    userLogIn.oneTimeVerificationToken = undefined;
    userLogIn.oneTimeVerificationTokenExpire = undefined;
    await userLogIn.save({ validateBeforeSave: false });
  } catch (err) {
    userLogIn.oneTimeVerificationToken = undefined;
    userLogIn.oneTimeVerificationTokenExpire = undefined;
    await userLogIn.save({ validateBeforeSave: false });
    resHandler(res, 400, 'failed', 'Failed to verify the user ' + err.message);
  }
};

exports.protect = async (req, res, next) => {
  let token; //= req.cookies.jwt;
  //console.log("cookies", req.cookies);

  try {
    //doing this via cookies now

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return resHandler(res, 400, 'Failed', 'Not logged in ');
    }

    const decodedUserId = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const findUser = await userSchema.findById(decodedUserId.id.id);

    req.user = findUser;

    if (!findUser) {
      return resHandler(res, 400, 'Failed', 'user does not exits');
    }

    next();
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Not logged in ' + err.message);
  }
};

exports.getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const getUser = await userSchema.findById(userId);

    resHandler(res, 200, 'Success', { message: 'User found', getUser });
  } catch (err) {
    resHandler(res, 400, 'failed', 'Failed to get the user ' + err.message);
  }
};

exports.deleteUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const getUser = await userSchema.findByIdAndUpdate(userId, {
      isActive: false,
    });
    if (!getUser) return resHandler(res, 400, 'Failed', 'Invalid user id');
    resHandler(res, 200, 'Success', 'User deActivate');
  } catch (err) {
    resHandler(res, 400, 'Failed', 'Failed to delete user ' + err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const identifyUser = await userSchema.findOne({ email: req.body.email });

    if (!identifyUser) return resHandler(res, 400, 'User email does not exits');

    //send a reset token to the user email
    const resetToken = identifyUser.createResetPasswordToken();
    await identifyUser.save({ validateBeforeSave: false });

    const URL = `${req.protocol}://${req.get(
      'host'
    )}/v1/memories/resetPassword/${resetToken}`;

    try {
      await sendEmail({
        to: identifyUser.email,
        subject: 'Reset Number',
        text: `Valid for 10 mins password reset number:${resetToken}`,
      });
      resHandler(res, 201, 'Success', {
        message: `A reset link has been sent to the ${identifyUser.email}`,
        identifyUser,
      });
    } catch (err) {
      this.passwordResetToken = undefined;
      this.passwordResetExpire = undefined;
      await identifyUser.save({ validateBeforeSave: false });
      return resHandler(res, 400, 'failed to send reset link ' + err.message);
    }
  } catch (err) {
    resHandler(res, 400, 'Something went worng ' + err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const sixDigitCode = req.body.code;
    const hashPassword = crypto
      .createHash('sha256')
      .update(sixDigitCode)
      .digest('hex');

    const findUser = await userSchema.findOne({
      passwordResetToken: hashPassword,
    });

    if (!findUser) return resHandler(res, 400, 'Failed', 'Invalid Code');

    if (Date.now() > findUser.passwordResetExpire)
      return resHandler(res, 400, 'Failed', 'Token Expired');

    if (req.body.password !== req.body.confirmPassword)
      return resHandler(res, 400, 'Failed', "Password didn't match");

    //reset the password
    findUser.password = req.body.password;
    findUser.confirmPassword = req.body.confirmPassword;
    findUser.passwordChangedAt = new Date();
    findUser.passwordResetExpire = undefined;
    findUser.passwordResetToken = undefined;

    await findUser.save();

    const token = createToken({ id: findUser._id });

    resHandler(res, 200, 'Success', {
      message: 'Password reset success',
      token,
    });
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to reset the Password ' + err.message
    );
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  try {
    const userId = await userSchema.findOne({ _id: req.user.id });

    if (!userId) return resHandler(res, 400, 'Failed', 'user does not exits');

    const checkCurrentPassword = await userId.passwordMatch(
      currentPassword,
      userId.password
    );

    if (checkCurrentPassword === false)
      return resHandler(res, 400, 'Failed', 'Current password is wrong');

    const passwordMatch = newPassword === confirmNewPassword;

    if (!passwordMatch)
      return resHandler(res, 400, 'Failed', "Password didn't match");

    userId.password = newPassword;
    userId.passwordChangedAt = new Date();
    await userId.save({ validateBeforeSave: false });
    resHandler(res, 200, 'Success', 'Your Password have been updated');
  } catch (err) {
    resHandler(
      res,
      400,
      'Failed',
      'Failed to update the paassword ' + err.message
    );
  }
};

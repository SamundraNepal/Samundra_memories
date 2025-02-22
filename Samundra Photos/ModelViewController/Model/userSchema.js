const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'Must have First name'] },
  lastName: { type: String, required: [true, 'Must have Last name'] },
  storage: { type: String, default: '1GB' },
  imageLink: { type: String, default: 'missing' },

  photoAlbums: { type: [String], default: [] },
  videoAlbums: { type: [String], default: [] },

  accountCreatedDate: { type: String, default: new Date() },
  password: {
    type: String,
    required: [true, 'Must have a password'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Must have a confirmPassword'],
    select: false,
  },
  email: { type: String, required: [true, 'Must have email'], unique: true },
  isActive: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },

  lockedAlbums: {
    type: [
      {
        albumName: {
          type: String,
          default: '',
        },
        isLocked: {
          type: Boolean,
          default: false,
        },
        albumPassword: {
          type: String,
          default: '',
        },
      },
    ],
    default: [
      {
        albumName: '',
        isLocked: false,
        albumPassword: '',
      },
    ],
  },
  isApproved: { type: Boolean, default: false },

  oneTimeVerificationToken: { type: String },
  oneTimeVerificationTokenExpire: { type: String, default: null },

  passwordResetToken: { type: String, select: false },
  passwordResetExpire: { type: String, select: false },
  passwordChangedAt: { type: String, select: false },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (this.role === 'admin') {
    this.isApproved = true;
  }

  next();
});
userSchema.methods.passwordMatch = async function (
  currentUserPassword,
  dataBasePassword
) {
  return await bcrypt.compare(currentUserPassword, dataBasePassword);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createOneTimePasswordVerification = function () {
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  this.oneTimeVerificationToken = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');

  this.oneTimeVerificationTokenExpire = Date.now() + 5 * 60 * 1000;

  return OTP;
};

const UserSchema = mongoose.model('User', userSchema);

module.exports = UserSchema;

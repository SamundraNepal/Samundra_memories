const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { type } = require("os");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, "Must have First name"] },
  lastName: { type: String, required: [true, "Must have Last name"] },
  imageLink: { type: String, default:"missing" },
  password: {
    type: String,
    required: [true, "Must have a password"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Must have a confirmPassword"],
    select: false,
  },
  email: { type: String, required: [true, "Must have email"], unique: true },
  isActive: { type: Boolean, default: true, select: false },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    select: false,
  },

  isApproved: { type: Boolean, default: false, select: false },

  oneTimeVerificationToken: { type: String, select: false },
  oneTimeVerificationTokenExpire: { type: String, select: false },

  passwordResetToken: { type: String, select: false },
  passwordResetExpire: { type: String, select: false },
  passwordChangedAt: { type: String, select: false },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (this.role === "admin") {
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
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createOneTimePasswordVerification = function () {
  const OTP = crypto.randomBytes(6).toString("hex");
  this.oneTimeVerificationToken = crypto
    .createHash("sha256")
    .update(OTP)
    .digest("hex");

  this.oneTimeVerificationTokenExpire = Date.now() + 10 * 60 * 1000;

  return OTP;
};

const UserSchema = mongoose.model("User", userSchema);

module.exports = UserSchema;

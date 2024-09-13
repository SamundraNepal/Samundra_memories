const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { type } = require("os");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, "Must have First name"] },
  lastName: { type: String, required: [true, "Must have Last name"] },
  password: { type: String, required: [true, "Must have a password"] },
  confirmPassword: {
    type: String,
    required: [true, "Must have a confirmPassword"],
  },
  email: { type: String, required: [true, "Must have email"], unique: true },
  isActive:{type:Boolean , default:true},
  role:{type: String, enum:['admin','user'] , default:"user"},
  
  isApproved:{type:Boolean , default:false},
    oneTimeVerificationToken:{type:String},
    oneTimeVerificationTokenExpire:{type:String},

   passwordResetToken :{type:String},
   passwordResetExpire:{type:String},
   passwordChangedAt:{type:String}
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});


userSchema.pre('save',async function(next){
  if(this.role === 'admin')
  {

    this.isApproved = true;
  }

  next();
})
userSchema.methods.passwordMatch = async function (
  currentUserPassword,
  dataBasePassword
) {
  return await bcrypt.compare(currentUserPassword, dataBasePassword);
};


userSchema.methods.createResetPasswordToken = function(){

  const resetToken = crypto.randomBytes(32).toString('hex');
   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
   
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

   return resetToken;

};



userSchema.methods.createOneTimePasswordVerification = function(){

    const OTP = crypto.randomBytes(6).toString('hex');
     this.oneTimeVerificationToken = crypto.createHash('sha256').update(OTP).digest('hex');
   
  this.oneTimeVerificationTokenExpire = Date.now() + 10 * 60 * 1000;

   return OTP;

};


const UserSchema = mongoose.model("User", userSchema);

module.exports = UserSchema;

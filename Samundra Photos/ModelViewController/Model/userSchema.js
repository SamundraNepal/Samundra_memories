const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    firstName:{type:String , required :[true , "Must have First name"]},
    lastName:{type:String , required :[true , "Must have Last name"]},
    password:{type:String , required :[true , "Must have a password"]},
    confirmPassword:{type:String , required :[true , "Must have a confrimPassword"]},
    email:{type:String , required :[true , "Must have email"] , unique:true},

});

userSchema.pre('save',async function(next){

    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next();
})


userSchema.methods.passwordMatch = async function(currentUserPassword , dataBasePassword){

return await bcrypt.compare(currentUserPassword,dataBasePassword);

}




const UserSchema = mongoose.model('User',userSchema);

module.exports = UserSchema;
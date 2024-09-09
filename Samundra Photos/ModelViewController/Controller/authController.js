const userSchema = require('../Model/userSchema');
const resHandler = require("../../Utils/Error Handler/errorHandler");
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const createToken = function(id){
    return token = jwt.sign({id:id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRES_IN});
}


const createUserFolder = async function(data){

    const storageFolder = "Storage"
    const userFolder = path.join(storageFolder, data);
    const imageFolder = path.join(userFolder, "Images");
    const videoFolder = path.join(userFolder, "Videos");

    try{
        await fs.promises.mkdir(imageFolder, { recursive: true });
        await fs.promises.mkdir(videoFolder, { recursive: true });
        console.log("Folder is created");

    }catch(err){
        console.log(err.message);
    }
}



exports.singUpUser = async (req , res) =>{
      const userData = req.body; 
    try{
     if(userData.password != userData.confirmPassword)
      {
     return  resHandler(res, 400, 'Failed',"Password does not match");
     }    
     const createUserData = await userSchema.create(userData);

     const token = createToken({id:createUserData._id});
      await createUserFolder(createUserData.id);
     resHandler(res, 200, 'Success', {token,createUserData});


    }catch(err)
    {
       resHandler(res, 400, 'Failed',"Failed to create the user " + err.message);

    }
}


exports.logInUser = async(req , res) =>{

    const logInUserDetails = req.body;
    try{
         const userLogIn = await userSchema.findOne({email:logInUserDetails.email}).select('+password');
        if(!userLogIn)  return resHandler(res, 400, 'Failed',"User does not exits");        
        
        const isMatched = await userLogIn.passwordMatch(logInUserDetails.password , userLogIn.password);
        const token = createToken({id:userLogIn._id});


        // check password
        if(!isMatched)
        {
           return resHandler(res, 400, 'Failed',"incorrect password");
        }

        resHandler(res, 200, 'Success', {message: "Logged in", token});

    }catch(err)
    {
        resHandler(res, 400, 'Failed',"Failed to get the data " + err.message);

    }
}


exports.protect = async(req , res, next) =>{

    let token;
    try{
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token)
        {
        return resHandler(res, 400, 'Failed',"Not logged in ");     
        }

        const decodedUserId = jwt.verify(token, process.env.JWT_SECRET_KEY);
         req.user= decodedUserId.id;

      //   resHandler(res, 200, 'Success', req.user);


        next();
    }catch(err)
    {
        resHandler(res, 400, 'Failed',"Not logged in " + err.message);
    }

}


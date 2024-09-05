const imageModel = require("../Model/imageSchema");
const ExifReader = require('exifreader');


exports.createImage = async (req, res) => {
  try {

    const tags = await ExifReader.load(req.files[0].path)
    
   // const imageDate = tags['DateTimeOriginal'].description;
    

    const imagePromiseResolve = req.files.map(async (file) => {
      return await imageModel.create({
        imageName: file.filename,
        imageStorage: file.destination,
        imageUrl: `${req.protocol}://${req.get("host")}/${file.destination}/${
          file.filename
        }`,
      });


    });

    const imageDetails = await Promise.all(imagePromiseResolve);

    res.status(200).json({
      status: "Success",
      message: "Image Data created",
      imageType: {
        data: tags,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: "Failed to create image data " + err.message,
    });
  }
};

exports.getAllImage =async(req,res)=>{
    try{
    const imagedata = await imageModel.find();
    res.status(200).json({status:"Success", result:imagedata.length , datas:{imagedata}})
  }catch(err){
    res.status(400).json({status:"Failed", message:"Failed to get the data " + err.message})
  }
}

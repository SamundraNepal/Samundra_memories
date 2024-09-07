const imageModel = require("../Model/imageSchema");
const ExifReader = require("exifreader");

const readPhotoData = async function (req) {
  const tags = req.files.map(async (file) => {
    return await ExifReader.load(file.path);
  });
  return (exifFiles = await Promise.all(tags));
};

const readImageMetaData = async function (req) {
  const tag = await readPhotoData(req);

  
  const imageMetaDataProcesssing = tag.map( async (metaData) => ({


      make: metaData.Make?.description,
      model: metaData.Model?.description,
      dateTimeOriginal: metaData.DateTimeOriginal?.description,
      offsetTime: metaData.OffsetTime?.description,
      
      pixelXDimension: metaData.PixelXDimension?.description,
      pixelYDimension: metaData.PixelYDimension?.description,

      gPSLatitudeRef: metaData.GPSLatitudeRef?.description,
      gPSLatitude: metaData.GPSLatitude?.value,
      
      gPSLongitudeRef: metaData.GPSLongitudeRef?.description,
      gPSLongitude: metaData.GPSLongitude?.value,
      
      gPSAltitudeRef: metaData.GPSAltitudeRef?.description,
      gPSAltitude: metaData.GPSAltitude?.value,
    
    }));

    
    const imageDataProcessing = req.files.map(async (file) => {
      return {
        imageName: file.filename,
        imageSize:file.size,
        imageURL: `${req.protocol}://${req.get("host")}/${file.destination}/${
          file.filename
        }`,
      };
    });

    
        //wait for all the promises
   const imageDataProcesssed = await Promise.all(imageDataProcessing);
   const imageMetaDataProcesssed = await Promise.all(imageMetaDataProcesssing);
    // Combine the data
    return combinedData = imageDataProcesssed.map((image, index) => ({
      ...image,
      ...imageMetaDataProcesssed[index],
    }));

    
};

exports.createImage = async (req, res) => {
  try {

    //gets the processed data from the reqs
    const imageMetaData = await readImageMetaData(req);

    // Database Created
    const createData = await imageModel.create(imageMetaData);

    res.status(200).json({
      status: "Success",
      message: "Image Data created",
      imageType: {
        data: createData,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: "Failed to create image data " + err.message,
    });
  }
};

exports.getAllImage = async (req, res) => {
  try {
    const imagedata = await imageModel.find({isActive:true});
    res.status(200).json({
      status: "Success",
      result: imagedata.length,
      datas: { imagedata },
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: "Failed to get the data " + err.message,
    });
  }
};

exports.deleteImage = async(req , res) =>{
  
  try{

    const imageId = req.params.id;
    if(!imageId)
    {
      res.status(400).json({status:"Failed", message:"image does not exits"} + err.message);

    }
    const deleteImageId = await imageModel.findByIdAndUpdate(imageId,{isActive:false})
    res.status(200).json({status:"Success", message:"image delete successfull",deleteImageId});
  } catch(err){
    res.status(400).json({status:"Failed", message:"Failed to delete the image"} + err.message);

  }

}

exports.restoreImage = async(req,res)=>{
  try{

    const imageId = req.params.id;
    if(!imageId)
    {
      res.status(400).json({status:"Failed", message:"image does not exits"} + err.message);

    }
    const deleteImageId = await imageModel.findByIdAndUpdate(imageId,{isActive:true})
    res.status(200).json({status:"Success", message:"image delete successfull",deleteImageId});
  } catch(err){
    res.status(400).json({status:"Failed", message:"Failed to delete the image"} + err.message);

  }
}

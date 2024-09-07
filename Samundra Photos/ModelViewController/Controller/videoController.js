const {exiftool} = require("exiftool-vendored");
const video_Schema = require("../Model/videosSchema");

const getVideoMetaData = async function(req){
  const readVideoMetaData =  req.files.map(async(metadata)=>{return await exiftool.read(metadata.path)});
 const data = await Promise.all(readVideoMetaData);
 return data;
}

const readVideoMetaData = async function(req){
    const videoMetaData = await getVideoMetaData(req);
    const processingVideoMetaData = videoMetaData.map(
        async (data) =>({
        make:data?.AndroidModel,
        videoDuration:data?.Duration,
        dateTimeOriginal: data.CreateDate?.rawValue,
        videoWidthAndHeight:data?.ImageSize,
        videoMegaPixels:data?.Megapixels,
        videoTakenPlace:data.CreateDate?.zoneName,
        gPSLatitudeAndLongitude:data?.GPSCoordinates

    }));


    const imageDataProcessing = req.files.map(async (file) => {
        return {
            viodeoName: file.filename,
            videoFileSize:file.size,
             videoURL: `${req.protocol}://${req.get("host")}/${file.destination}/${
            file.filename
          }`,
        };
      });

      const processedImageData = await Promise.all(imageDataProcessing);

    const processedVideoMetaData = await Promise.all(processingVideoMetaData);

    return combinedData = processedImageData.map((imageData, index) => ({
        ...imageData,
        ...processedVideoMetaData[index],
      }));
  

}

exports.createVideo = async(req,res)=>{

const videoMetaData = await readVideoMetaData(req);

const createData = await video_Schema.create(videoMetaData);
 res.status(200).json({status:"Success",message: createData})
}

exports.getAllVideo = async (req, res) => {


    try {
      const videodata = await video_Schema.find({isActive:true});



      res.status(200).json({
        status: "Success",
        result: videodata.length,
        datas: { videodata },
      });
    } catch (err) {
      res.status(400).json({
        status: "Failed",
        message: "Failed to get the data " + err.message,
      });
    }
  };
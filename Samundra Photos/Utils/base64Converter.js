const sharp = require('sharp');
const path = require('path');
exports.Base64Converter = async function (filePath) {
  console.log(filePath);
  try {
    const resolvedPath = path.resolve(filePath);
    const resizeImagePath = await sharp(resolvedPath)
      .resize(500, 500)
      .toBuffer();
    const base64String = resizeImagePath.toString('base64');

    return 'data:image/jpeg;base64,' + base64String;
  } catch (err) {
    return console.log('failed to create base64 String', err.message);
  }
};

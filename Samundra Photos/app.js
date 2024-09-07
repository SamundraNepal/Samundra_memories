//project dependency
const express = require("express");
const app = express();
const path = require("path");

//inheritance files
const imagesRoute = require("./Routes/imageRoute");
const videosRoute = require("./Routes/videoRoute");


//allows access to this path files
app.use(
  "/Storage/Images",
  express.static(path.join(__dirname, "Storage/Images"))
);


//allows access to this path files
app.use(
  "/Storage/Videos",
  express.static(path.join(__dirname, "Storage/Videos"))
);

app.use("/v1/memories/images", imagesRoute);
app.use("/v1/memories/videos", videosRoute);


module.exports = app;

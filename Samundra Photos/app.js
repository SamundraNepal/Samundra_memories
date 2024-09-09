//project dependency
const express = require("express");
const app = express();
const path = require("path");

//inheritance files
const imagesRoute = require("./Routes/imageRoute");
const videosRoute = require("./Routes/videoRoute");
const userRoutes = require('./Routes/userRoute');

app.use(express.json()); // Middleware to parse incoming JSON bodies

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
app.use("/v1/memories", userRoutes);


module.exports = app;

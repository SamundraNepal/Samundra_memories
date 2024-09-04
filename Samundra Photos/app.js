//project dependency
const express = require("express");
const app = express();
const path = require("path");

//inheritance files
const imagesRoute = require("./Routes/imageRoute");

//allows access to this path files
app.use(
  "/Storage/Images",
  express.static(path.join(__dirname, "Storage/Images"))
);
app.use("/v1/memories/images", imagesRoute);

module.exports = app;

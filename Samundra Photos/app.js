//project dependency
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors"); // Import the cors package
var cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(express.json()); // Middleware to parse incoming JSON bodies
//inheritance files
const imagesRoute = require("./Routes/imageRoute");
const videosRoute = require("./Routes/videoRoute");
const userRoutes = require("./Routes/userRoute");

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Specify allowed HTTP methods
    credentials: true, // Important for cookies
  })
);

//allows access to this path files
app.use("/Storage", express.static(path.join(__dirname, "Storage")));

//allows access to this path files
app.use("/Storage", express.static(path.join(__dirname, "Storage")));

app.use("/v1/memories/images", imagesRoute);
app.use("/v1/memories/videos", videosRoute);
app.use("/v1/memories", userRoutes);

module.exports = app;

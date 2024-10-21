//project dependency
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors'); // Import the cors package
var cookieParser = require('cookie-parser');

//for security
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
//Global

//limit request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100, //1 hrs request limit

  message:
    'Too many request received. Server is in cool down period. Server will be back after an hour',
});
app.use('/v1', limiter);

//set security HTTP Request
app.use(
  helmet({
    crossOriginIsolated: false,
  })
);
app.use(mongoSanitize()); // prevent no sql attacks

//data sanitize
app.use(xss());

app.use(cookieParser());

app.use(express.json()); // Middleware to parse incoming JSON bodies
//inheritance files
const imagesRoute = require('./Routes/imageRoute');
const videosRoute = require('./Routes/videoRoute');
const userRoutes = require('./Routes/userRoute');

app.use(
  cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
    credentials: true, // Important for cookies
  })
);

//allows access to this path files
app.use('/Storage', express.static(path.join(__dirname, 'Storage')));

app.use('/v1/memories/images', imagesRoute);
app.use('/v1/memories/videos', videosRoute);
app.use('/v1/memories', userRoutes);

module.exports = app;

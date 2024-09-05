const app = require("./app.js");
const dotenv = require("dotenv");
const mongoose = require("mongoose"); // Corrected the typo here

//global varibables
dotenv.config({ path: "./config.env" });

mongoose
  .connect("mongodb://localhost:27017")
  .then(() => {
    console.log("Connection to Data Base is Successfull");
  })
  .catch((err) => {
    "Failed to connect to the DataBase. Error reason: " + err;
  });

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Samundra photos is listening on port  127.0.0.1:${process.env.SERVER_PORT}`
  );
});

const app = require("./app.js");
const dontenv = require("dotenv");
const mongose = require("mongoose");

//global varibables
dontenv.config({ path: "./config.env" });

mongose
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

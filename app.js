const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const cron = require("node-cron");
// const moment = require("moment");
const upload = multer();

const mongoose = require("mongoose");
require("dotenv").config();
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// defining folder for uploading the files/images/documents
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/views", express.static(path.join(__dirname, "views")));

// main admin api
const mainRoute = require("./routers/mainRoutes");
app.use("/v1/udbtApi", mainRoute);

//test api
app.get("/", (req, res) => {
  res
    .status(200)
    .send(`<center><h1>💲💻 Welcome to the UDBT 📱💲</h1></center>`);
});
// console.log(process.env.MONGODB_CONNECTION_LIVE);

//connecting to database
mongoose.set("strictQuery", true);
mongoose
  .connect(
    // process.env.MONGODB_CONNECTION_LIVE,
    process.env.MONGODB_CONNECTION_ATLAS
  )
  .then(() => {
    console.log("The database was successfully connected.");
  })
  .catch(() => {
    console.log("Sorry, the database was not found!");
  });

// to keep ruunung the server
cron.schedule("0 */3 * * * *", () => {
  console.log("Server running on port 6300");
});

// app.js main listner
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});

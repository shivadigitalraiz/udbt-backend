const express = require("express");
const aboutusRoutes = express.Router();

// controller
const aboutuscontroller = require("../../controller/admin/aboutus.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");
const { upload_aboutusImg } = require("../../middleware/uploadImage");

// routes
aboutusRoutes.post(
  "/getaboutus",
  verifyAdminToken,
  upload_aboutusImg.none(),
  aboutuscontroller.getaboutus
);

aboutusRoutes.put(
  "/editaboutus",
  verifyAdminToken,
  upload_aboutusImg.fields([
    {
      name: "image",
      maxCount: 5,
    },
  ]),
  aboutuscontroller.editaboutus
);

module.exports = aboutusRoutes;

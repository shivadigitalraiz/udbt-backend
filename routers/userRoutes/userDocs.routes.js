const express = require("express");
const userDocRoutes = express.Router();

//controller
const userDocsController = require("../../controller/user/userDocs.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//routes
userDocRoutes.post(
  "/getpolicies",
  //verifyAdminToken,
  userDocsController.getPolicies
);

userDocRoutes.post(
  "/getallposts",
  verifyAdminToken,
  userDocsController.getalluploadedpostsbyall
);

userDocRoutes.post(
  "/getallinvestors",
  verifyAdminToken,
  userDocsController.getallinvestorsforuser
);

userDocRoutes.post(
  "/getallstartups",
  verifyAdminToken,
  userDocsController.getallstartupsforuser
);

module.exports = userDocRoutes;

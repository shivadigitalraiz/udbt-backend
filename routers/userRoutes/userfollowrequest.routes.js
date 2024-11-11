const express = require("express");
const userfollwerrequestRoutes = express.Router();

//controller
const userfollowRequestController = require("../../controller/user/userfollowers.Controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//routes
//add
userfollwerrequestRoutes.post(
  "/addfollower",
  verifyAdminToken,
  userfollowRequestController.addFollower
);

//get all
userfollwerrequestRoutes.post(
  "/getallfollowrequests",
  verifyAdminToken,
  userfollowRequestController.getalluserfollowers
);

//accept follow request
userfollwerrequestRoutes.put(
  "/acceptfolowrequest",
  verifyAdminToken,
  userfollowRequestController.acceptfollowrequest
);

userfollwerrequestRoutes.delete(
  "/deletefollowrequest",
  verifyAdminToken,
  userfollowRequestController.deletefollowrequests
);

module.exports = userfollwerrequestRoutes;

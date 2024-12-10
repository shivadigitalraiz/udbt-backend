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

//remove to the user
userfollwerrequestRoutes.put(
  "/removefollowrequest",
  verifyAdminToken,
  userfollowRequestController.removefollowrequest
);

//request the follow request
userfollwerrequestRoutes.put(
  "/requesttouser",
  verifyAdminToken,
  userfollowRequestController.requesttotheuser
);

//10-12-2024
userfollwerrequestRoutes.post(
  "/getmyfollwersandfollowing",
  verifyAdminToken,
  userfollowRequestController.getallfollowersandmyfollowings
);
module.exports = userfollwerrequestRoutes;

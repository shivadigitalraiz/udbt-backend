const express = require("express");
const usersharedpostRoutes = express.Router();

//controller
const userSharedPostsController = require("../../controller/user/usershareposts.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//routes
//add
usersharedpostRoutes.post(
  "/addsharedpost",
  verifyAdminToken,
  userSharedPostsController.addshareposts
);

//get all saved posts
usersharedpostRoutes.post(
  "/getallsharedposts",
  verifyAdminToken,
  userSharedPostsController.getallsharedposts
);

module.exports = usersharedpostRoutes;

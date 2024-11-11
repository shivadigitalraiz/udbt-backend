const express = require("express");
const userlikepostRoutes = express.Router();

//controller
const userlikepostsController = require("../../controller/user/userLikes.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//routes
//add
userlikepostRoutes.post(
  "/addlikepost",
  verifyAdminToken,
  userlikepostsController.adduserlikeposts
);

userlikepostRoutes.post(
  "/getalllikedposts",
  verifyAdminToken,
  userlikepostsController.getalllikedposts
);

module.exports = userlikepostRoutes;

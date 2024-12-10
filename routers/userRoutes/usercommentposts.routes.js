const express = require("express");
const usercommentpostRoutes = express.Router();

//controller
const usercomentPostsController = require("../../controller/user/usercomentPosts.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//routes
//add
usercommentpostRoutes.post(
  "/addcommentpost",
  verifyAdminToken,
  usercomentPostsController.addCommentToThePosts
);

usercommentpostRoutes.post(
  "/getallcomentedposts",
  verifyAdminToken,
  usercomentPostsController.getallcommentedposts
);

usercommentpostRoutes.delete(
  "/deletecommentpost/:id",
  verifyAdminToken,
  usercomentPostsController.deletetothecommentedposts
);

//29-11-2024
usercommentpostRoutes.post(
  "/getcommentsbypostid",
  verifyAdminToken,
  usercomentPostsController.getallcommentstothepostsbyid
);

module.exports = usercommentpostRoutes;

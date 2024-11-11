const express = require("express");
const usersavepostRoutes = express.Router();

//controller
const userSavedPostsController = require("../../controller/user/userSavePosts.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//routes
//add
usersavepostRoutes.post(
  "/addsaveposts",
  verifyAdminToken,
  userSavedPostsController.savePosts
);

//get all saved posts
usersavepostRoutes.post(
  "/getallsavedposts",
  verifyAdminToken,
  userSavedPostsController.getallsavedposts
);

//delete
usersavepostRoutes.delete(
  "/deltesaveposts/:id",
  verifyAdminToken,
  userSavedPostsController.unsavePosts
);

module.exports = usersavepostRoutes;

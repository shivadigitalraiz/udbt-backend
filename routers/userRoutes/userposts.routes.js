const express = require("express");
const uploadedpostsRoutes = express.Router();

//controller
const userUploadPosts = require("../../controller/user/userPosts.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");
const { upload_useruploadpost } = require("../../middleware/uploadImage");

//routes
//add
uploadedpostsRoutes.post(
  "/adduploadpost",
  verifyAdminToken,
  upload_useruploadpost.single("image"),
  userUploadPosts.adduseruploadposts
);

//get all user support requests
uploadedpostsRoutes.post(
  "/getalluseruploadposts",
  verifyAdminToken,
  upload_useruploadpost.none(),
  userUploadPosts.getalluseruploadposts
);

//edit
uploadedpostsRoutes.put(
  "/edituploadedpost/:id",
  verifyAdminToken,
  upload_useruploadpost.single("image"),
  userUploadPosts.edituseruploadedpost
);

//delete
uploadedpostsRoutes.delete(
  "/deleteusersupport/:id",
  verifyAdminToken,
  upload_useruploadpost.none(),
  userUploadPosts.deleteuseruploadedposts
);

module.exports = uploadedpostsRoutes;

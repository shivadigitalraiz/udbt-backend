const express = require("express");
const adminpostRoutes = express.Router();

// controller
const adminpostsController = require("../../controller/admin/adminposts.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// routes
//get all active investors
adminpostRoutes.delete(
  "/deletepost/:id",
  verifyAdminToken,
  adminpostsController.deleteuseruploadedpostsbyadmin
);

//get all active startus
adminpostRoutes.post(
  "/getalluseruploadedposts",
  verifyAdminToken,
  adminpostsController.getalluserpostsforadmin
);

//update support request
adminpostRoutes.post(
  "/getalldeletedpostsforadmin",
  verifyAdminToken,
  adminpostsController.getalluserdeletedpostsforadmin
);

//get post by id
adminpostRoutes.post(
  "/getpostbyid",
  verifyAdminToken,
  adminpostsController.getuploadedpostbyuserforadmin
);

module.exports = adminpostRoutes;

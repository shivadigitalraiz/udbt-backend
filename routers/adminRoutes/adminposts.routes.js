const express = require("express");
const adminpostRoutes = express.Router();

// controller
const admindocsController = require("../../controller/admin/adminposts.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// routes
//get all active investors
adminpostRoutes.delete(
  "/deletepost/:id",
  verifyAdminToken,
  admindocsController.deleteuseruploadedpostsbyadmin
);

//get all active startus
adminpostRoutes.post(
  "/getalluseruploadedposts",
  verifyAdminToken,
  admindocsController.getalluserpostsforadmin
);

//update support request
adminpostRoutes.post(
  "/getalldeletedpostsbyadmin",
  verifyAdminToken,
  admindocsController.getalluserdeletedpostsforadmin
);

module.exports = adminpostRoutes;

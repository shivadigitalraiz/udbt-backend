const express = require("express");
const admindocsRoutes = express.Router();

// controller
const admindocsController = require("../../controller/admin/admindocs.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// routes
//get all active investors
admindocsRoutes.post(
  "/getallactiveivestors",
  verifyAdminToken,
  admindocsController.getallactiveinvestors
);

//get all active startus
admindocsRoutes.post(
  "/getallactivestartups",
  verifyAdminToken,
  admindocsController.getallactivestartups
);

//update support request
admindocsRoutes.put(
  "/blockorunblock",
  verifyAdminToken,
  admindocsController.userStatusUpdate
);

//get BYID
admindocsRoutes.post(
  "/getuserbyid",
  verifyAdminToken,
  admindocsController.GETUSERLISTBYID
);

//get blocked user || either investors or startups
admindocsRoutes.post(
  "/getallbloackedusers",
  verifyAdminToken,
  admindocsController.getallblockedusersforadmin
);

//
//get blocked user || either investors or startups
admindocsRoutes.post(
  "/getallusers",
  verifyAdminToken,
  admindocsController.getallusersforadmin
);

module.exports = admindocsRoutes;

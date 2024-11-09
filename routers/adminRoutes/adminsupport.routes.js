const express = require("express");
const adminsupportRoutes = express.Router();

// controller
const adminSupportController = require("../../controller/admin/adminsupport.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// routes
//get all active users
adminsupportRoutes.post(
  "/getallusersupports",
  verifyAdminToken,
  adminSupportController.getQueries
);

//update support request
adminsupportRoutes.put(
  "/updateusersupport/:id",
  verifyAdminToken,
  adminSupportController.upateusersstatussupport
);

module.exports = adminsupportRoutes;

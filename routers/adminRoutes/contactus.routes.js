const express = require("express");
const contactusRoutes = express.Router();

// controller
const contactusController = require("../../controller/admin/contactus.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// get contactus
contactusRoutes.post(
  "/getcontactus",
  verifyAdminToken,
  contactusController.getcontactus
);

// edit contactus
contactusRoutes.put(
  "/editcontactus",
  verifyAdminToken,
  contactusController.editcontactus
);

module.exports = contactusRoutes;

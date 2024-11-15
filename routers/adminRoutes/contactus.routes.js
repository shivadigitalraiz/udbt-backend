const express = require("express");
const contactusRoutes = express.Router();

// controller
const contactusController = require("../../controller/admin/contactus.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");
const { upload_contactusImg } = require("../../middleware/uploadImage");

// get contactus
contactusRoutes.post(
  "/getcontactus",
  verifyAdminToken,
  upload_contactusImg.none(),
  contactusController.getcontactus
);

// edit contactus
contactusRoutes.put(
  "/editcontactus",
  upload_contactusImg.single("image"),
  verifyAdminToken,
  contactusController.editcontactus
);

module.exports = contactusRoutes;

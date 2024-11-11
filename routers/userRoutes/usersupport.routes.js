const express = require("express");
const usersupportRoutes = express.Router();

//controller
const userSupportController = require("../../controller/user/userSupport.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");
const { upload_usersupport } = require("../../middleware/uploadImage");

//routes
//add
usersupportRoutes.post(
  "/addusersupport",
  verifyAdminToken,
  upload_usersupport.single("image"),
  userSupportController.addusersupport
);

//get all user support requests
usersupportRoutes.post(
  "/getallusersupport",
  verifyAdminToken,
  upload_usersupport.none(),
  userSupportController.getAllUserRequests
);

//delete
usersupportRoutes.delete(
  "/deleteusersupport/:id",
  verifyAdminToken,
  upload_usersupport.none(),
  userSupportController.deleteusersupport
);

module.exports = usersupportRoutes;

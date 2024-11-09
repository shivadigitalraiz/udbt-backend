const express = require("express");
const adminRoutes = express.Router();

// controller
const admincontroller = require("../../controller/admin/admin.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");
const { upload_profileImg } = require("../../middleware/uploadImage");

// routes
// adminRegistration
adminRoutes.post(
  "/adminregistration",
  upload_profileImg.none(),
  admincontroller.adminRegistration
);

// admin login
adminRoutes.post(
  "/adminlogin",
  upload_profileImg.none(),
  admincontroller.adminlogin
);

// admin get profile
adminRoutes.post(
  "/getadminprofile",
  verifyAdminToken,
  upload_profileImg.none(),
  admincontroller.getadminProfile
);

// update admin profile pic
adminRoutes.put(
  "/editprofilepic",
  verifyAdminToken,
  upload_profileImg.single("profilePic"),
  admincontroller.updateadminProfileImg
);

// update profile
adminRoutes.put(
  "/editprofile",
  verifyAdminToken,
  upload_profileImg.none(),
  admincontroller.updateprofile
);

// change admin password
adminRoutes.post(
  "/changepass",
  verifyAdminToken,
  upload_profileImg.none(),
  admincontroller.changeAdminpassword
);

/*****************************||Forgot password ||***********************/
// send otp
adminRoutes.post("/sendotp", admincontroller.generateOtp);

// compare otp
adminRoutes.post("/compareotp", admincontroller.compareOtp);

// reset password
adminRoutes.post("/resetpass", admincontroller.resetpassword);

module.exports = adminRoutes;

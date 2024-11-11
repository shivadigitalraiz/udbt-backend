const express = require("express");
const userRoutes = express.Router();

// controller
const authcontroller = require("../../controller/user/userAuth.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");
const { upload_userImg } = require("../../middleware/uploadImage");

//register
userRoutes.post("/userregister", authcontroller.userRegistration);

//verificaion
userRoutes.post("/verififcation", authcontroller.verification);

// //user login
userRoutes.post("/uselogin", authcontroller.userLogin);

// //user get profile
userRoutes.post(
  "/usergetprofile",
  verifyAdminToken,
  authcontroller.getuserProfile
);

// //edit password
userRoutes.put(
  "/usereditprofile",
  verifyAdminToken,
  upload_userImg.single("profilePic"),
  authcontroller.edituserProfile
);

// //userlogout
userRoutes.post("/userlogout", verifyAdminToken, authcontroller.userlogout);

// //forgot pass
userRoutes.post("/userforgotpass", authcontroller.forgotPassword);

// //set pass
userRoutes.post("/usersetpass", authcontroller.setpassword);

// //
//userRoutes.post("/loginotp", authcontroller.loginOtp);

// //send email verification
userRoutes.post(
  "/changepassword",
  verifyAdminToken,
  authcontroller.changepassword
);

userRoutes.post(
  "/deleteaccount",
  verifyAdminToken,
  authcontroller.deleteAccount
);

module.exports = userRoutes;

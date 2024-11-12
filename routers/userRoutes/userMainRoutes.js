const express = require("express");
const userRoute = express.Router();

// verifyToken
const { verifyAdminToken } = require("../../middleware/verifyToken");

//importing routes
const authRoutes = require("./auth.routes");
const usersupportRoutes = require("./usersupport.routes");
const uploadedpostsRoutes = require("./userposts.routes");
const userlikepostRoutes = require("./userLikeposts.routes");
const usersavepostRoutes = require("./usersaveposts.routes");
const usercommentpostRoutes = require("./usercommentposts.routes");
const userfollwerrequestRoutes = require("./userfollowrequest.routes");
const notificationRoutes = require("./notification.routes");
const usersharedpostRoutes = require("./usersharedposts.routes");
const userDocRoutes = require("./userDocs.routes");

/*************** APi's for the above **************/
userRoute.use("/auth", authRoutes);
userRoute.use("/support", usersupportRoutes);
userRoute.use("/uploadedpost", uploadedpostsRoutes);
userRoute.use("/likeposts", userlikepostRoutes);
userRoute.use("/savedPosts", usersavepostRoutes);
userRoute.use("/commentposts", usercommentpostRoutes);
userRoute.use("/followrequest", userfollwerrequestRoutes);
userRoute.use("/notification", notificationRoutes);
userRoute.use("/sharedposts", usersharedpostRoutes);
userRoute.use("/userdoc", userDocRoutes);

//single doc controller

//single doc routes for the above controllers

module.exports = userRoute;

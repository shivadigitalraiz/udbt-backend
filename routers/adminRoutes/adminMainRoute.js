const express = require("express");
const adminRoute = express.Router();

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// importing routes
const adminRoutes = require("./auth.routes");
const policiesRoutes = require("./policeis.routes");
const aboutusRoutes = require("./aboutus.routes");
const contactusRoutes = require("./contactus.routes");
const notificationRoutes = require("./notification.routes");
const adminsupportRoutes = require("./adminsupport.routes");
const intrestsRoutes = require("./intrests.routes");
const admindocsRoutes = require("./admindocs.routes");
const adminpostRoutes = require("./adminposts.routes");

/******************** *API'S********************/
adminRoute.use("/auth", adminRoutes);
adminRoute.use("/police", policiesRoutes);
adminRoute.use("/aboutus", aboutusRoutes);
adminRoute.use("/contactus", contactusRoutes);
adminRoute.use("/notification", notificationRoutes);
adminRoute.use("/support", adminsupportRoutes);
adminRoute.use("/intrest", intrestsRoutes);
adminRoute.use("/users", admindocsRoutes);
adminRoute.use("/posts", adminpostRoutes);

// single doc controllers
const admindashboardController = require("../../controller/admin/admindashboard.controller");

//routes
adminRoute.post(
  "/getdashboard",
  verifyAdminToken,
  admindashboardController.getDashboardata
);

module.exports = adminRoute;

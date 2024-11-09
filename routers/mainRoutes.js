const adminRoute = require("./adminRoutes/adminMainRoute");

const userAppRoute = require("./userRoutes/userMainRoutes");

const mainRoute = require("express").Router();

// admin panel to other management
mainRoute.use("/admin", adminRoute);

mainRoute.use("/userApp", userAppRoute);

module.exports = mainRoute;

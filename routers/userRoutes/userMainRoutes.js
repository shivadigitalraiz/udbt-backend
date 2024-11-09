const express = require("express");
const userRoute = express.Router();

// verifyToken
const { verifyAdminToken } = require("../../middleware/verifyToken");

//importing routes
const authRoutes = require("./auth.routes");

/***************AUTHENTICATION Api**************/
userRoute.use("/auth", authRoutes);

//single doc controller

//single doc routes for the above controllers

module.exports = userRoute;

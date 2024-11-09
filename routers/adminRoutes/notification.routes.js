const express = require("express");
const notificationRoutes = express.Router();

// controller
const notificationController = require("../../controller/admin/sendAdminNotification.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// add notification
notificationRoutes.post(
  "/addnotification",
  verifyAdminToken,
  notificationController.addNotification
);

// get notifications
notificationRoutes.post(
  "/getallnotifications",
  verifyAdminToken,
  notificationController.getAllNotifications
);

// delete notification
notificationRoutes.delete(
  "/deletenotification/:id",
  verifyAdminToken,
  notificationController.deletenotification
);

module.exports = notificationRoutes;

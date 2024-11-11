const express = require("express");
const notificationRoutes = express.Router();

// controller
const notificationController = require("../../controller/user/usernotification.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// getnotification status
notificationRoutes.post(
  "/getnotificationstatus",
  verifyAdminToken,
  notificationController.getnotificationstatus
);

// update notification status
notificationRoutes.post(
  "/updatenotificationbell",
  verifyAdminToken,
  notificationController.updateNotificationBell
);

// delete notifications
notificationRoutes.post(
  "/deletenotification",
  verifyAdminToken,
  notificationController.deleteNotification
);

// delete all notifications
notificationRoutes.post(
  "/deleteallnotifications",
  verifyAdminToken,
  notificationController.deleteUserAllNotification
);

notificationRoutes.post(
  "/getallnotificationsbyuserid",
  verifyAdminToken,
  notificationController.getAllNotificationbyUserId
);

module.exports = notificationRoutes;

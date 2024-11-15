const express = require("express");
const chatRoutes = express.Router();

// controller
const chatcontroller = require("../../controller/user/useChat.controller");

//middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

//register
chatRoutes.post("/getAllChats", verifyAdminToken, chatcontroller.getAllChats);

//verificaion
chatRoutes.post(
  "/getChatHistory/:userId/:contactId",
  chatcontroller.getChatHistory
);

//user login
chatRoutes.post(
  "/updateReadStatus",
  verifyAdminToken,
  chatcontroller.updateReadStatus
);

chatRoutes.post("/unseenCount", verifyAdminToken, chatcontroller.unseenCount);

// //user  create pass
// userRoutes.post(
//   "/usercreatepass",
//   verifyAdminToken,
//   authcontroller.createPassword
// );

module.exports = chatRoutes;

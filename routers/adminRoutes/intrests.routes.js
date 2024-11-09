const express = require("express");
const intrestsRoutes = express.Router();

// controller
const intrestsController = require("../../controller/admin/intrests.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// get contactus
intrestsRoutes.post(
  "/addintrest",
  verifyAdminToken,
  intrestsController.addintrests
);

// getalll
intrestsRoutes.post(
  "/getall",
  verifyAdminToken,
  intrestsController.getallintrests
);

// edit
intrestsRoutes.put(
  "/editintrest/:id",
  verifyAdminToken,
  intrestsController.editintrests
);

// delete
intrestsRoutes.delete(
  "/deleteintrest/:id",
  verifyAdminToken,
  intrestsController.deleteintrest
);

module.exports = intrestsRoutes;

const express = require("express");
const policiesRoutes = express.Router();

// controller
const policiescontroller = require("../../controller/admin/policies.controller");

// middleware
const { verifyAdminToken } = require("../../middleware/verifyToken");

// routes
// routes
policiesRoutes.post("/get", verifyAdminToken, policiescontroller.getPolicies);

policiesRoutes.put(
  "/updatetermsAndCondition",
  verifyAdminToken,
  policiescontroller.updatetermsConditions
);

policiesRoutes.put(
  "/updateprivacyPolicy",
  verifyAdminToken,
  policiescontroller.updatePrivacypolicy
);

// policiesRoutes.put(
//   "/refundPolicy",
//   verifyAdminToken,
//   policiescontroller.updaterefundPolicy
// );

module.exports = policiesRoutes;

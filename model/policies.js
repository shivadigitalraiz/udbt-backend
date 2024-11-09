const mongoose = require("mongoose");
const policie = new mongoose.Schema({
  termsAndCondition: {
    type: String,
  },
  privacyPolicy: {
    type: String,
    trim: true,
  },
  // refundPolicy: {
  //   type: String,
  //   trim: true,
  // },

  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("policies", policie);

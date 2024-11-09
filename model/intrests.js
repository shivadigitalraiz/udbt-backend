const mongoose = require("mongoose");
const intrests = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  // },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("intrestss", intrests);

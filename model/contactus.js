const mongoose = require("mongoose");
const contactus = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  alternatePhone: {
    type: String,
  },
  email: {
    type: String,
    default: "",
  },
  fromTime: {
    type: String,
    trim: true,
  },
  toTime: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("contactus", contactus);

const mongoose = require("mongoose");
const notification = require("./notification");
const user = new mongoose.Schema({
  //personal details
  userUniqueId: {
    type: String,
    trim: true,
  },
  fullNameorCompanyName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  password: {
    type: String,
  },
  profilePic: {
    type: String,
    trim: true,
  },
  isloggedin: {
    type: Boolean,
    default: false,
  },
  designationorCompanytype: {
    type: String,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },

  //------ for investments -------- //
  investements: {
    type: String,
    //default: "",
  },
  funds: {
    type: String,
    default: "",
  },
  //------ for investments -------- //
  about: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  fcmtoken: {
    type: String,
    trim: true,
  },
  notification_bell: {
    type: Boolean,
    default: true,
  },
  blockedReason: {
    type: String,
    default: "",
  },
  isStartupOrInvestor: {
    type: String,
    enum: ["investor", "startup"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  //------ for startup -------- //
  founded: {
    type: String,
    trim: true,
    default: "",
  },
  valuation: {
    type: String,
    trim: true,
    default: "",
  },
  //------ for startup -------- //
  interests: {
    type: Array,
  },
  isdeleted: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  logCreatedDate: {
    type: String,
    trim: true,
  },
  logModifiedDate: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("users", user);

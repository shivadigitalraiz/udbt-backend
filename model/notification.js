const mongoose = require("mongoose");

const notification = new mongoose.Schema({
  date: {
    type: String,
    trim: true,
  },
  time: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  sendTo: {
    type: String,
    trim: true,
    enum: ["All", "User", "Investors", "Startups"],
  },
  users: {
    type: Array,
  },
  isdeleted: {
    type: String,
    enum: ["No", "Yes"],
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

module.exports = mongoose.model("notifications", notification);

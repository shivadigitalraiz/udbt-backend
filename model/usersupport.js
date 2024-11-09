const mongoose = require("mongoose");
const usersupport = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userName: {
    type: String,
  },
  ticketId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
  },
  reply: {
    type: String,
    default: "",
  },
  reason: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["solved", "pending", "unsloved", "leadreplacement"],
    default: "pending",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("usersupports", usersupport);

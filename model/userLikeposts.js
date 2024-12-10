const mongoose = require("mongoose");
const userPost = new mongoose.Schema({
  date: {
    type: String,
    trim: true,
  },
  time: {
    type: String,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userName: {
    type: String,
    trim: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});
  module.exports = mongoose.model("likePosts", userPost);

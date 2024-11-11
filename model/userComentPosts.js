const mongoose = require("mongoose");
const savePost = new mongoose.Schema({
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userName: {
    type: String,
    trim: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("commentposts", savePost);

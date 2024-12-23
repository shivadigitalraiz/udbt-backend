const mongoose = require("mongoose");
const userPost = new mongoose.Schema({
  postUniqueId: {
    type: String,
    trim: true,
  },
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
  image: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  video: {
    type: String,
    trim: true,
    default: "",
  },

  // isSaved: {
  //   type: Boolean,
  //   default: false,
  // },
  // isDelete: {
  //   type: Boolean,
  //   default: false,
  // },
  // sharedUsers: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "users",
  //   },
  // ],
  // likedUsers: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "users",
  //   },
  // ],

  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
  isdeleted: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  isblocked: {
    type: Boolean,
    default: false,
  },
  postBlockedReason: {
    type: String,
    trim: true,
  },
  deletedBy: {
    type: String,
    trim: true,
  },
});
module.exports = mongoose.model("userPosts", userPost);

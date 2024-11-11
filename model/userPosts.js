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

  isSaved: {
    type: Boolean,
    default: false,
  },
  // isDelete: {
  //   type: Boolean,
  //   default: false,
  // },
  sharedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  likedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],

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
});
module.exports = mongoose.model("userPosts", userPost);

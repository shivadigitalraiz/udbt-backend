const mongoose = require("mongoose");
const savePost = new mongoose.Schema({
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  //   userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //   },
  followerName: {
    type: String,
    trim: true,
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  // followRequest: {
  //   type: String,
  //   enum: ["requested", "accepted", "removed"],
  //   default: "requested",
  //   trim: true,
  // },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("followers", savePost);

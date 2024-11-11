// importing models
const userModel = require("../../model/user");
const userLikesModel = require("../../model/userLikeposts");
const userPostsModel = require("../../model/userPosts");
const savePostsModel = require("../../model/savePosts");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

//saved posts
exports.savePosts = async function (req, res) {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    console.log(postId, "postId", "1234");

    // Check if the post is already saved by the user
    const existingSave = await savePostsModel.findOne({ userId, postId });

    if (existingSave) {
      // If the post is already saved, unsave it (remove from saved posts)
      await savePostsModel.findOneAndDelete({ userId, postId });

      // Send notification for unsaving the post
      //   await notificationUtil.createNotification({
      //     sendTo: "User",
      //     userList: userId,
      //     subject: "Post Unsaved",
      //     description: "You have removed this post from your saved posts.",
      //   });

      return res
        .status(200)
        .json({ success: true, message: "Removed from saved posts" });
    } else {
      // Get the current IST time and date
      const istDateTime = DateTime.now().setZone("Asia/Kolkata");
      const logDate = istDateTime.toISO({ includeOffset: true });
      const time = istDateTime.toFormat("hh:mm a");

      const user = await userModel.findOne({ _id: userId });

      // Create a new saved post
      const newSavedPost = new savePostsModel({
        date: logDate.slice(0, 10),
        time,
        postId,
        userId,
        userName: user ? user.fullNameorCompanyName : "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });

      // Save the new saved post to the database
      await newSavedPost.save();

      // Send notification for saving the post
      //   await notificationUtil.createNotification({
      //     sendTo: "User",
      //     userList: userId,
      //     subject: "Post Saved",
      //     description: "You have added this post to your saved posts.",
      //   });

      return res
        .status(200)
        .json({ success: true, message: "Added to saved posts" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

exports.getallsavedposts = async function (req, res) {
  try {
    let condition = {};

    condition.userId = req.userId;
    console.log(condition);

    const savedPosts = await savePostsModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (savedPosts) {
      res.status(200).json({
        success: true,
        message: "Saved posts's have been retrived successfully ",
        savedPosts: savedPosts,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// delete : unsave
exports.unsavePosts = async function (req, res) {
  try {
    const userPosts = await savePostsModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (userPosts) {
      res.status(200).json({
        success: true,
        message: "Post has been unsaved",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Bad request",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

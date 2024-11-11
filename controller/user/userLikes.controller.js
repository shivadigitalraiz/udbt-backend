// importing models
const userModel = require("../../model/user");
const userLikesModel = require("../../model/userLikeposts");
const userPostsModel = require("../../model/userPosts");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
//const notificationUtil = require("../../utils/notificationUtills");

//add
exports.adduserlikeposts = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const user = await userModel.findOne({ _id: req.userId });
    const useruploadedposts = await userPostsModel.findOne({
      _id: req.body.postId,
    });

    // Check if the user has already liked the post
    const existingLike = await userLikesModel.findOne({
      postId: req.body.postId,
      userId: req.userId,
    });

    if (existingLike) {
      // If a like already exists, remove it (unlike)
      await userLikesModel.findOneAndDelete({
        postId: req.body.postId,
        userId: req.userId,
      });

      // Send unlike notification
      // await notificationUtil.createNotification({
      //   sendTo: "User",
      //   userList: req.userId,
      //   subject: "Post Unliked",
      //   description: `You have unliked the post.`,
      // });

      return res.status(200).json({
        success: true,
        message: "Unliked the post successfully",
      });
    } else {
      // If no like exists, create a new like (like action)
      const userPostObj = new userLikesModel({
        date: logDate.slice(0, 10),
        time,
        postId: req.body.postId,
        userId: req.userId,
        userName: user ? user.name : "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });

      // Save the new like
      const uploadposts = await userPostObj.save();

      if (uploadposts) {
        //   // Send like notification
        //   await notificationUtil.createNotification({
        //     sendTo: "User",
        //     userList: req.userId,
        //     subject: "Post Liked",
        //     description: `Thank you for liking the post.`,
        //   });

        return res.status(200).json({
          success: true,
          message: "Liked the post successfully",
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Please try again" });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

exports.getalllikedposts = async function (req, res) {
  try {
    let condition = {};

    condition.userId = req.userId;
    console.log(condition);

    const likedPosts = await userLikesModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (likedPosts) {
      res.status(200).json({
        success: true,
        message: "Liked posts's have been retrived successfully ",
        likedPosts: likedPosts,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

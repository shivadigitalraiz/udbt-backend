// importing models
const userModel = require("../../model/user");
const userLikesModel = require("../../model/userLikeposts");
const userPostsModel = require("../../model/userPosts");
const savePostsModel = require("../../model/savePosts");
const sharedPostsModel = require("../../model/sharedposts");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

//shared posts
exports.addshareposts = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const user = await userModel.findOne({ _id: req.userId });

    const usersharedposts = new sharedPostsModel({
      date: logDate.slice(0, 10),
      time,
      postId: req.body.postId,
      userId: req.userId,
      userName: user ? user.fullNameorCompanyName : "",
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    // Save the support object
    const sharedPosts = await usersharedposts.save();
    if (sharedPosts) {
      res.status(200).json({
        success: true,
        message: "Post has been shared successfully",
      });

      // await notificationUtil.createNotification({
      //   sendTo: "User",
      //   userList: req.userId,
      //   subject: "Request Successful",
      //   description: `Thank you for using Lead interio.`,
      //   // subject: req.body.title,
      //   // description: req.body.description,
      // });
    } else {
      res.status(400).json({ success: false, message: "Please try again" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//get all
exports.getallsharedposts = async function (req, res) {
  try {
    let condition = {};

    condition.userId = req.userId;
    console.log(condition);

    const sharedPosts = await sharedPostsModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (sharedPosts) {
      res.status(200).json({
        success: true,
        message: "Share posts's have been retrived successfully ",
        sharedPosts: sharedPosts,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

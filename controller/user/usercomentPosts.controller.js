// importing models
const userModel = require("../../model/user");
const userLikesModel = require("../../model/userLikeposts");
const userPostsModel = require("../../model/userPosts");
const usercommentPostsModel = require("../../model/userComentPosts");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
//const notificationUtil = require("../../utils/notificationUtills");

exports.addCommentToThePosts = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const user = await userModel.findOne({ _id: req.userId });
    const userUploadedPosts = await userPostsModel.findOne({
      _id: req.body.postId,
    });

    // Create a new comment object
    const usercommentsObj = new usercommentPostsModel({
      date: logDate.slice(0, 10),
      time,
      postId: req.body.postId,
      comment: req.body.comment, // Fixed typo here
      userId: req.userId,
      userName: user ? user.fullNameorCompanyName : "",
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    // Save the new comment
    const commentposts = await usercommentsObj.save();

    if (commentposts) {
      // Send comment notification
      //   await notificationUtil.createNotification({
      //     sendTo: "User",
      //     userList: req.userId,
      //     subject: "New Comment",
      //     description: "You have commented on the post.",
      //   });

      return res.status(200).json({
        success: true,
        message: "Comment has been added to the post successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Please try again" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//GET ALL
exports.getallcommentedposts = async function (req, res) {
  try {
    const userId = req.userId;

    const commentPosts = await usercommentPostsModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $sort: {
          logCreatedDate: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "userposts",
          localField: "postId",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      {
        $unwind: {
          path: "$postDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          postId: 1,
          comment: 1,
          logCreatedDate: 1,
          userObjectId: "$userDetails._id",
          fullNameorCompanyName: "$userDetails.fullNameorCompanyName",
          profilePic: "$userDetails.profilePic",
          postImage: "$postDetails.image",
          postDescription: "$postDetails.description",
        },
      },
    ]);

    if (commentPosts && commentPosts.length > 0) {
      res.status(200).json({
        success: true,
        message: "Commented posts have been retrieved successfully",
        commentPosts: commentPosts,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No commented posts found",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

//delete
exports.deletetothecommentedposts = async function (req, res) {
  try {
    const userPosts = await usercommentPostsModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (userPosts) {
      res.status(200).json({
        success: true,
        message: "Comment has been removed",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Please try again",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//GET ALL COMMENTS BY SENDING POSTID
exports.getallcommentstothepostsbyid = async function (req, res) {
  try {
    console.log("API Hit: /getallcommentstothepostsbyid");

    console.log("req.body:----------------------", req.body);
    const postId = req.body.postId;

    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const comments = await usercommentPostsModel.aggregate([
      {
        $match: { postId: new mongoose.Types.ObjectId(postId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "userposts",
          localField: "postId",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      {
        $unwind: {
          path: "$postDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          comment: 1,
          date: 1,
          time: 1,
          // userId: 1,
          fullNameorCompanyName: "$userDetails.fullNameorCompanyName",
          profilePic: "$userDetails.profilePic",
          userObjectId: "$userDetails._id",
          logCreatedDate: 1,
          logModifiedDate: 1,
          postImage: "$postDetails.image",
          postId: 1,
          postDescription: "$postDetails.description",
        },
      },
      {
        $sort: {
          logCreatedDate: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: comments || [],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

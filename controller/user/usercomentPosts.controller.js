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

exports.getallcommentedposts = async function (req, res) {
  try {
    let condition = {};

    condition.userId = req.userId;
    console.log(condition);

    const commentPosts = await usercommentPostsModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (commentPosts) {
      res.status(200).json({
        success: true,
        message: "Commented posts's have been retrived successfully ",
        commentPosts: commentPosts,
      });
    }
  } catch (err) {
    console.log(err);
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

// exports.addcomenttotheposts = async function (req, res) {
//   try {
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });
//     const time = istDateTime.toFormat("hh:mm a");

//     const user = await userModel.findOne({ _id: req.userId });
//     const useruploadedposts = await userPostsModel.findOne({
//       _id: req.body.postId,
//     });

//     // Check if the user has already liked the post
//     const excistingcomment = await usercommentPostsModel.findOne({
//       postId: req.body.postId,
//       userId: req.userId,
//     });

//     if (excistingcomment) {
//       // If a like already exists, remove it (unlike)
//       await usercommentPostsModel.findOneAndDelete({
//         postId: req.body.postId,
//         userId: req.userId,
//       });

//       // Send unlike notification
//       // await notificationUtil.createNotification({
//       //   sendTo: "User",
//       //   userList: req.userId,
//       //   subject: "Post Unliked",
//       //   description: `You have unliked the post.`,
//       // });

//       return res.status(200).json({
//         success: true,
//         message: "Unliked the post successfully",
//       });
//     } else {
//       // If no like exists, create a new like (like action)
//       const userPostObj = new usercommentPostsModel({
//         date: logDate.slice(0, 10),
//         time,
//         postId: req.body.postId,
//         comment: req.bodt.comment,
//         userId: req.userId,
//         userName: user ? user.name : "",
//         logCreatedDate: logDate,
//         logModifiedDate: logDate,
//       });

//       // Save the new like
//       const uploadposts = await userPostObj.save();

//       if (uploadposts) {
//         //   // Send like notification
//         //   await notificationUtil.createNotification({
//         //     sendTo: "User",
//         //     userList: req.userId,
//         //     subject: "Post Liked",
//         //     description: `Thank you for liking the post.`,
//         //   });

//         return res.status(200).json({
//           success: true,
//           message: "Comment has been given to  the post successfully",
//         });
//       } else {
//         return res
//           .status(400)
//           .json({ success: false, message: "Please try again" });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };

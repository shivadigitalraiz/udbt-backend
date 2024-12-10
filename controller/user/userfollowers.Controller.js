// importing models
const userModel = require("../../model/user");
const userSupportModel = require("../../model/usersupport");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
const userFollowersModel = require("../../model/userfollower");

//const notificationUtil = require("../../utils/notificationUtills");

//28-11-2024
exports.addFollower = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    console.log("req.body@followings:------------------------------", req.body);
    const userId = req.userId;
    const followingId = req.body.followingId;

    // Prevent self-following
    //  if (userId === followingId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You cannot follow yourself.",
    //   });
    // }

    const user = await userModel.findOne({ _id: req.userId });

    // Check if the user has already liked the post
    const excistingfollower = await userFollowersModel.findOne({
      followerId: req.userId,
      followingId: req.body.followingId,
    });

    if (excistingfollower) {
      // If a like already exists, remove it (unlike)
      await userFollowersModel.findOneAndDelete({
        followerId: req.userId,
        followingId: req.body.followingId,
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
        message: "Unfollowed successfully",
      });
    } else {
      // If no like exists, create a new like (like action)
      const userObj = new userFollowersModel({
        date: logDate.slice(0, 10),
        time,
        followingId,
        followerId: userId,
        followerName: user ? user.fullNameorCompanyName : "",
        //followRequest: "requested",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });

      // Save the new like
      const savedUser = await userObj.save();

      if (savedUser) {
        //   // Send like notification
        //   await notificationUtil.createNotification({
        //     sendTo: "User",
        //     userList: req.userId,
        //     subject: "Post Liked",
        //     description: `Thank you for liking the post.`,
        //   });

        return res.status(200).json({
          success: true,
          message: "Following the user",
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

//accept follow request
exports.acceptfollowrequest = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    // Find and update the follow request based on both the ID and followerId
    const upfollowrequest = await userFollowersModel.findOneAndUpdate(
      {
        _id: req.body.id,
        followingId: req.body.followingId,
      },
      {
        $set: {
          followRequest: "accepted",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    // Check if the follow request was successfully updated
    if (upfollowrequest) {
      res.status(200).json({
        success: true,
        message: "Follow request accepted successfully",
      });
      // // await notificationUtil.createNotification({
      // //   sendTo: "User",
      // //   userList: req.body.followingId, // Send notification to the followingId
      // //   subject: "Follow Request Accepted",
      // //   description: `Your follow request has been accepted.`,
      // // });

      // res.status(200).json({
      //   success: true,
      //   message: "Follow request accepted successfully and notification sent.",
      // });
    } else {
      res.status(400).json({
        success: false,
        message: "Follow request not found or already updated",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//delete follow requests
exports.deletefollowrequests = async function (req, res) {
  try {
    // Find and delete the follow request based on both the ID and followerId
    const upfollowrequest = await userFollowersModel.findOneAndDelete({
      _id: req.body.id,
      // followingId: req.body.followingId,
      followerId: req.body.followerId,
    });

    if (upfollowrequest) {
      res.status(200).json({
        success: true,
        message: "Follow request deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Follow request not found or already deleted",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get all user ALL followers,Requested followers, Accepted followers
exports.getalluserfollowers = async function (req, res) {
  try {
    // let condition = {};

    // console.log(condition);

    // Fetch all follow requests for the user with user details
    const allrequests = await userFollowersModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followingId",
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
        $match: {
          // ...condition,
          followerId: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          logCreatedDate: 1,
          followerId: 1,
          followerName: 1,
          followingId: 1,
          followRequest: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
          userName: "$userDetails.fullNameorCompanyName",
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userCity: "$userDetails.city",
          userProfilePic: "$userDetails.profilePic",
        },
      },
      { $sort: { logCreatedDate: -1 } },
    ]);

    const allrequestsCount = allrequests.length;

    const requestedfollowers = await userFollowersModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followingId",
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
        $match: {
          // ...condition,
          followRequest: "requested",
          followerId: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          logCreatedDate: 1,
          followerId: 1,
          followerName: 1,
          followingId: 1,
          followRequest: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
          userName: "$userDetails.fullNameorCompanyName",
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userCity: "$userDetails.city",
          userProfilePic: "$userDetails.profilePic",
        },
      },
      { $sort: { logCreatedDate: -1 } },
    ]);

    const requestedfollowersCount = requestedfollowers.length;

    const acceptedfollowers = await userFollowersModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followingId",
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
        $match: {
          // ...condition,
          followRequest: "accepted",
          followerId: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          logCreatedDate: 1,
          followerId: 1,
          followerName: 1,
          followingId: 1,
          followRequest: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
          userName: "$userDetails.fullNameorCompanyName",
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userCity: "$userDetails.city",
          userProfilePic: "$userDetails.profilePic",
        },
      },
      { $sort: { logCreatedDate: -1 } },
    ]);

    const acceptedfollowersCount = acceptedfollowers.length;

    return res.status(200).json({
      success: true,
      message: "Data retrived successfully",
      allrequests,
      requestedfollowers,
      acceptedfollowers,
      //counbts
      allrequestsCount,
      requestedfollowersCount,
      acceptedfollowersCount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

//remove follower -- to remove the follow request
exports.removefollowrequest = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    // Find and update the follow request based on both the ID and followerId
    const upfollowrequest = await userFollowersModel.findOneAndUpdate(
      {
        _id: req.body.id,
        followingId: req.body.followingId,
      },
      {
        $set: {
          followRequest: "removed",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    // Check if the follow request was successfully updated
    if (upfollowrequest) {
      res.status(200).json({
        success: true,
        message: "Follow request removed successfully",
      });
      // // await notificationUtil.createNotification({
      // //   sendTo: "User",
      // //   userList: req.body.followingId, // Send notification to the followingId
      // //   subject: "Follow Request Accepted",
      // //   description: `Your follow request has been accepted.`,
      // // });

      // res.status(200).json({
      //   success: true,
      //   message: "Follow request accepted successfully and notification sent.",
      // });
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

//request  to the follower : --------------- follow request sending
exports.requesttotheuser = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    // Find and update the follow request based on both the ID and followerId
    const upfollowrequest = await userFollowersModel.findOneAndUpdate(
      {
        _id: req.body.id,
        followingId: req.body.followingId,
      },
      {
        $set: {
          followRequest: "requested",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    // Check if the follow request was successfully updated
    if (upfollowrequest) {
      res.status(200).json({
        success: true,
        message: "Follow request removed successfully",
      });
      // // await notificationUtil.createNotification({
      // //   sendTo: "User",
      // //   userList: req.body.followingId, // Send notification to the followingId
      // //   subject: "Follow Request Accepted",
      // //   description: `Your follow request has been accepted.`,
      // // });

      // res.status(200).json({
      //   success: true,
      //   message: "Follow request accepted successfully and notification sent.",
      // });
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
/************************************************************************************************/
//get all follow requests
exports.getallfollowersandmyfollowings = async function (req, res) {
  try {
    const userId = req.userId;

    // Aggregation for users following me (followers)
    const myfollowers = await userFollowersModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followerId",
          foreignField: "_id",
          as: "followerDetails",
        },
      },
      {
        $unwind: "$followerDetails",
      },
      {
        $match: { followingId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $project: {
          userObjectId: "$followerDetails._id",
          followerName: "$followerDetails.fullNameorCompanyName",
          followerProfilePic: "$followerDetails.profilePic",
          isStartupOrInvestor: "$followerDetails.isStartupOrInvestor",
          logCreatedDate: 1,
        },
      },
      {
        $sort: { logCreatedDate: -1 },
      },
    ]);

    // Aggregation for users I am following (followings)
    const iamfollowing = await userFollowersModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "_id",
          as: "followingDetails",
        },
      },
      {
        $unwind: "$followingDetails",
      },
      {
        $match: { followerId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $project: {
          userObjectId: "$followingDetails._id",
          isStartupOrInvestor: "$followingDetails.isStartupOrInvestor",
          followingName: "$followingDetails.fullNameorCompanyName",
          followingProfilePic: "$followingDetails.profilePic",
          logCreatedDate: 1,
        },
      },
      {
        $sort: { logCreatedDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Follow Requests have been retrieved successfully",
      myfollowers: myfollowers,
      iamfollowing: iamfollowing,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

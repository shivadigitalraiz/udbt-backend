// importing models
const userModel = require("../../model/user");
const userSupportModel = require("../../model/usersupport");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
const userFollowersModel = require("../../model/userfollower");

//const notificationUtil = require("../../utils/notificationUtills");

exports.addFollower = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const userId = req.userId;
    const followingId = req.body.followingId;

    // Check if the user is already following the specified followingId
    const existingFollower = await userFollowersModel.findOne({
      followerId: userId,
      followingId: followingId,
    });

    if (existingFollower) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    const user = await userModel.findOne({ _id: userId });

    // Create a new follower entry
    const userObj = new userFollowersModel({
      date: logDate.slice(0, 10),
      time,
      followingId,
      followerId: userId,
      followerName: user ? user.fullNameorCompanyName : "",
      followRequest: "requested",
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    // Save the follower object
    const savedUser = await userObj.save();
    if (savedUser) {
      res.status(200).json({
        success: true,
        message: "Follow request submitted successfully",
      });

      //   // Send notification for the follow request
      //   await notificationUtil.createNotification({
      //     sendTo: "User",
      //     userList: followingId,
      //     subject: "New Follow Request",
      //     description: `${
      //       user ? user.fullNameorCompanyName : "A user"
      //     } has requested to follow you.`,
      //   });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to submit follow request" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//get all follow requests
// exports.getalluserfollowers = async function (req, res) {
//   try {
//     const condition = { followerId: req.userId };
//     console.log(condition);

//     // Fetch all follow requests for the user
//     const followRequests = await userFollowersModel.find(condition).sort({
//       logCreatedDate: -1,
//     });

//     // Fetch only the follow requests where followRequest is "requested"
//     const requestedfollowrequests = await userFollowersModel
//       .find({
//         ...condition,
//         followRequest: "requested",
//       })
//       .sort({ logCreatedDate: -1 });

//     // Fetch only the follow requests where followRequest is "requested"
//     const acceptedfollowrequests = await userFollowersModel
//       .find({
//         ...condition,
//         followRequest: "accepted",
//       })
//       .sort({ logCreatedDate: -1 });

//     if (followRequests) {
//       res.status(200).json({
//         success: true,
//         message: "Follow Requests have been retrieved successfully",
//         followRequests: followRequests,
//         requestedfollowrequests: requestedfollowrequests,
//         acceptedfollowrequests: acceptedfollowrequests,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: "Something went wrong" });
//   }
// };

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
      followingId: req.body.followingId,
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

//----------------------------------------------------------------------//
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

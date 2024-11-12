// importing models
const userModel = require("../../model/user");
const { DateTime } = require("luxon");
const userLikesModel = require("../../model/userLikeposts");
const userPostsModel = require("../../model/userPosts");
const savePostsModel = require("../../model/savePosts");
const commentPostsModel = require("../../model/userComentPosts");
const followersModel = require("../../model/userfollower");
const mongoose = require("mongoose");

//get all active investors
exports.getallactiveinvestors = async function (req, res) {
  try {
    let condition = {
      status: "active",
      isStartupOrInvestor: "investor",
      isdeleted: "No",
    };

    const { fromDate, toDate } = req.body;

    if (req.query.searchQuery && req.query.searchQuery !== "") {
      let regex = new RegExp(req.query.searchQuery, "i");

      condition.$or = [{ fullNameorCompanyName: regex }, { phone: regex }];
    }

    var dates = req.body.logCreatedDate;

    // Utility function to validate date format (YYYY-MM-DD)
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    }

    // Ensure dates are valid and properly formatted
    if (Array.isArray(dates) && dates.length > 0) {
      if (dates.length > 1 && isValidDate(dates[0]) && isValidDate(dates[1])) {
        condition.logCreatedDate = {
          $gte: new Date(dates[0] + "T00:00:00.000Z").toISOString(),
          $lte: new Date(dates[1] + "T23:59:59.999Z").toISOString(),
        };
      } else if (dates.length === 1 && isValidDate(dates[0])) {
        condition.logCreatedDate = {
          $gte: new Date(dates[0] + "T00:00:00.000Z").toISOString(),
          $lte: new Date(dates[0] + "T23:59:59.999Z").toISOString(),
        };
      }
    }

    if (
      fromDate !== "" &&
      toDate !== "" &&
      isValidDate(fromDate) &&
      isValidDate(toDate)
    ) {
      if (fromDate === toDate) {
        // If fromDate and toDate are the same, filter for a single date
        condition.logCreatedDate = {
          $gte: new Date(fromDate + "T00:00:00.000Z").toISOString(),
          $lte: new Date(toDate + "T23:59:59.999Z").toISOString(),
        };
      } else {
        // If fromDate and toDate are different, filter for a date range
        condition.logCreatedDate = {
          $gte: new Date(fromDate + "T00:00:00.000Z").toISOString(),
          $lte: new Date(toDate + "T23:59:59.999Z").toISOString(),
        };
      }
    }

    const user = await userModel.aggregate([
      {
        $match: {
          ...condition,
        },
      },

      {
        $sort: {
          logCreatedDate: -1,
        },
      },
    ]);

    let userExcell = [];
    user.map((val) => {
      let obj = {
        logCreatedDate: val.logCreatedDate,
        userUniqueId: val.userUniqueId,
        fullNameorCompanyName: val.fullNameorCompanyName,
        phone: val.phone,
        city: val.city,
        investements: val.investements,
        designationorCompanytype: val.designationorCompanytype,
        funds: val.funds,
        email: val.email,
        bio: val.bio,
        about: val.about,
      };

      userExcell.push(obj);
    });

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      user: user,
      userExcell,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ succcess: false, message: "Something went wrong" });
  }
};

//get all startups
exports.getallactivestartups = async function (req, res) {
  try {
    let condition = {
      status: "active",
      isStartupOrInvestor: "startup",
      isdeleted: "No",
    };

    const { fromDate, toDate } = req.body;

    if (req.query.searchQuery && req.query.searchQuery !== "") {
      let regex = new RegExp(req.query.searchQuery, "i");

      condition.$or = [{ fullNameorCompanyName: regex }, { phone: regex }];
    }

    var dates = req.body.logCreatedDate;

    // Utility function to validate date format (YYYY-MM-DD)
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    }

    // Ensure dates are valid and properly formatted
    if (Array.isArray(dates) && dates.length > 0) {
      if (dates.length > 1 && isValidDate(dates[0]) && isValidDate(dates[1])) {
        condition.logCreatedDate = {
          $gte: new Date(dates[0] + "T00:00:00.000Z").toISOString(),
          $lte: new Date(dates[1] + "T23:59:59.999Z").toISOString(),
        };
      } else if (dates.length === 1 && isValidDate(dates[0])) {
        condition.logCreatedDate = {
          $gte: new Date(dates[0] + "T00:00:00.000Z").toISOString(),
          $lte: new Date(dates[0] + "T23:59:59.999Z").toISOString(),
        };
      }
    }

    if (
      fromDate !== "" &&
      toDate !== "" &&
      isValidDate(fromDate) &&
      isValidDate(toDate)
    ) {
      if (fromDate === toDate) {
        // If fromDate and toDate are the same, filter for a single date
        condition.logCreatedDate = {
          $gte: new Date(fromDate + "T00:00:00.000Z").toISOString(),
          $lte: new Date(toDate + "T23:59:59.999Z").toISOString(),
        };
      } else {
        // If fromDate and toDate are different, filter for a date range
        condition.logCreatedDate = {
          $gte: new Date(fromDate + "T00:00:00.000Z").toISOString(),
          $lte: new Date(toDate + "T23:59:59.999Z").toISOString(),
        };
      }
    }

    const user = await userModel.aggregate([
      {
        $match: {
          ...condition,
        },
      },

      {
        $sort: {
          logCreatedDate: -1,
        },
      },
    ]);

    let userExcell = [];
    user.map((val) => {
      let obj = {
        logCreatedDate: val.logCreatedDate,
        userUniqueId: val.userUniqueId,
        fullNameorCompanyName: val.fullNameorCompanyName,
        phone: val.phone,
        city: val.city,
        investements: val.investements,
        designationorCompanytype: val.designationorCompanytype,
        funds: val.funds,
        email: val.email,
        bio: val.bio,
        about: val.about,
        founded: val.founded,
        valuation: val.valuation,
      };

      userExcell.push(obj);
    });

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      user: user,
      userExcell,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ succcess: false, message: "Something went wrong" });
  }
};

exports.userStatusUpdate = async (req, res) => {
  const userId = req.body.userId;
  const blockedReason = req.body.blockedReason; // Get blockedReason from req.body

  try {
    const currentUser = await userModel.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the user's status: if "active", change to "inactive", and vice versa
    const newStatus = currentUser.status === "active" ? "inactive" : "active";

    // Prepare update data with conditional blockedReason if status is "inactive"
    const updateData = { status: newStatus };
    if (newStatus === "inactive" && blockedReason) {
      updateData.blockedReason = blockedReason;
    } else if (newStatus === "active") {
      updateData.blockedReason = ""; // Remove blockedReason when status is set to active
    }

    const statusUpdate = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Determine the status message based on the new status
    const statusMessage = newStatus === "active" ? "active" : "inactive";

    // Optionally, send a push notification to the user (commented out for now)
    const notificationSubject = `User Status Update`;
    const notificationDescription = `Your status has been updated to ${statusMessage}. Please check the app for details.`;

    //   await notificationUtil.createNotification({
    //     sendTo: "User",
    //     userList: [userId], // Send the notification to the updated user
    //     subject: notificationSubject,
    //     description: notificationDescription,
    //   });

    res.status(200).json({
      success: true,
      message: `User status has been updated to ${statusMessage}`,
      data: statusUpdate,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//GET BYID
exports.GETUSERLISTBYID = async function (req, res) {
  try {
    const userId = req.body.userId;

    const userResult = await userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    const user = userResult.length > 0 ? userResult[0] : {};

    const userUploadedposts = await userPostsModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isdeleted: "No",
        },
      },
      {
        $lookup: {
          from: "likeposts", // Replace with your actual likes collection name
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "commentposts",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          image: 1,
          description: 1,
          likeCount: { $size: "$likes" }, 
          commentCount: { $size: "$comments" }, // Coun
        },
      },
    ]);

    const usersavedposts = await savePostsModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "userposts",
          localField: "postId",
          foreignField: "_id",
          as: "userpost",
        },
      },
      {
        $unwind: {
          path: "$userpost",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "userpost.isdeleted": "No",
        },
      },
      {
        $lookup: {
          from: "likeposts",
          localField: "postId",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "commentposts",
          localField: "postId",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          postId: 1,
          postImage: "$userpost.image",
          postDescription: "$userpost.description",
          likeCount: { $size: "$likes" }, // Count of likes for each saved post
          commentCount: { $size: "$comments" },
        },
      },
    ]);

    const userlikeposts = await userLikesModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "userposts",
          localField: "postId",
          foreignField: "_id",
          as: "userpost",
        },
      },
      {
        $unwind: {
          path: "$userpost",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "userpost.isdeleted": "No",
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          postId: 1,
          postImage: "$userpost.image",
          postDescription: "$userpost.description",
        },
      },
    ]);

    const usercommentedposts = await commentPostsModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "userposts",
          localField: "postId",
          foreignField: "_id",
          as: "userpost",
        },
      },
      {
        $unwind: {
          path: "$userpost",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "userpost.isdeleted": "No",
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          postId: 1,
          comment: 1,
          postImage: "$userpost.image",
          postDescription: "$userpost.description",
        },
      },
    ]);

    const userFollowers = await followersModel.aggregate([
      {
        $match: {
          followingId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followerId",
          foreignField: "_id",
          as: "followerDetails",
        },
      },
      {
        $unwind: {
          path: "$followerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          followerId: "$followerId",
          followerName: "$followerDetails.fullNameorCompanyName",
          followerEmail: "$followerDetails.email",
          followerCity: "$followerDetails.city",
          followingPhone: "$followerDetails.phone",
          followinguserUniqueId: "$followerDetails.userUniqueId",
          date: 1,
          time: 1,
          logCreatedDate: 1,
        },
      },
    ]);

    const userFollowings = await followersModel.aggregate([
      {
        $match: {
          followerId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "_id",
          as: "followingDetails",
        },
      },
      {
        $unwind: {
          path: "$followingDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          followingId: "$followingId",
          followingName: "$followingDetails.fullNameorCompanyName",
          followingEmail: "$followingDetails.email",
          followingCity: "$followingDetails.city",
          followingPhone: "$followingDetails.phone",
          followinguserUniqueId: "$followingDetails.userUniqueId",
          date: 1,
          time: 1,
          logCreatedDate: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      user: user,
      userUploadedposts,
      usersavedposts,
      userlikeposts,
      usercommentedposts,
      userFollowers,
      userFollowings,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

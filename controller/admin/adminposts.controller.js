// importing models
const userPostsModel = require("../../model/userPosts");
const userModel = require("../../model/user");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
const notificationUtil = require("../../utils/notificationUtills");

//get all posts for admin which are not deleted
exports.getalluserpostsforadmin = async function (req, res) {
  try {
    let condition = {};

    // Utility function to validate date format (YYYY-MM-DD)
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    }

    // Date filtering based on fromDate and toDate
    const { fromDate, toDate } = req.body;
    const { searchQuery } = req.query;

    //------------------- BASED ON THE BOOKING DATE ------------------------//
    if (fromDate && toDate && isValidDate(fromDate) && isValidDate(toDate)) {
      if (fromDate === toDate) {
        condition.date = {
          $gte: fromDate,
          $lte: fromDate,
        };
      } else {
        condition.date = {
          $gte: fromDate,
          $lte: toDate,
        };
      }
    }

    const posts = await userPostsModel.aggregate([
      // {
      //   $match: { isdeleted: "No" },
      // },
      {
        $match: {
          ...condition,
          isdeleted: "No",
          isblocked: false,
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
        $unwind: "$userDetails",
      },
      // {
      //   $match: {
      //     "userDetails.isdeleted": "No",
      //     //  "userDetails.isStartupOrInvestor": req.body.isStartupOrInvestor,
      //     ...(searchQuery && {
      //       "userDetails.fullNameorCompanyName": {
      //         $regex: searchQuery,
      //         $options: "i",
      //       },
      //     }),
      //   },
      // },
      {
        $match: {
          "userDetails.isdeleted": "No",
          ...(searchQuery && {
            $or: [
              {
                "userDetails.fullNameorCompanyName": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
              { "userDetails.phone": { $regex: searchQuery, $options: "i" } },
              {
                "userDetails.userUniqueId": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
              { postUniqueId: { $regex: searchQuery, $options: "i" } },
              { logCreatedDate: { $regex: searchQuery, $options: "i" } },
              {
                "userDetails.logCreatedDate": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
              {
                "userDetails.isStartupOrInvestor": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
            ],
          }),
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          //userId: 1,
          image: 1,
          postUniqueId: 1,
          isblocked: 1,
          postBlockedReason: 1,
          isdeleted: 1,
          description: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
          //
          userObjectId: "$userDetails._id",
          userName: "$userDetails.fullNameorCompanyName",
          userUniqueId: "$userDetails.userUniqueId",
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userDesignation: "$userDetails.designationorCompanytype",
          userCity: "$userDetails.city",
          userIsStartupOrInvestor: "$userDetails.isStartupOrInvestor",
        },
      },
      {
        $sort: {
          logCreatedDate: -1,
        },
      },
    ]);

    const postsCount = posts.length;

    let postExcell = [];
    posts.map((val) => {
      let obj = {
        date: val.date,
        time: val.time,
        postUniqueId: val.postUniqueId,
        description: val.description,
        userName: val.userName,
        userUniqueId: val.userUniqueId,
        userEmail: val.userEmail,
        userPhone: val.userPhone,
        userDesignation: val.userDesignation,
        userCity: val.userCity,
        userIsStartupOrInvestor: val.userIsStartupOrInvestor,
      };

      postExcell.push(obj);
    });

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      data: posts,
      postExcell: postExcell,
      postsCount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get all deleted posts for admin
exports.getalluserdeletedpostsforadmin = async function (req, res) {
  try {
    let condition = {};

    // Utility function to validate date format (YYYY-MM-DD)
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    }

    // Date filtering based on fromDate and toDate
    const { fromDate, toDate } = req.body;
    const { searchQuery } = req.query;

    //------------------- BASED ON THE BOOKING DATE ------------------------//
    if (fromDate && toDate && isValidDate(fromDate) && isValidDate(toDate)) {
      if (fromDate === toDate) {
        condition.date = {
          $gte: fromDate,
          $lte: fromDate,
        };
      } else {
        condition.date = {
          $gte: fromDate,
          $lte: toDate,
        };
      }
    }
    const posts = await userPostsModel.aggregate([
      // {
      //   $match: { isdeleted: "Yes" },
      // },
      {
        $match: {
          ...condition,
          isblocked: true,
          isdeleted: { $ne: "Yes" },
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
        $unwind: "$userDetails",
      },
      // {
      //   $match: {
      //     "userDetails.isdeleted": "No",
      //     // "userDetails.isStartupOrInvestor": req.body.isStartupOrInvestor,
      //     ...(searchQuery && {
      //       "userDetails.fullNameorCompanyName": {
      //         $regex: searchQuery,
      //         $options: "i",
      //       },
      //     }),
      //   },
      // },
      {
        $match: {
          "userDetails.isdeleted": "No",
          ...(searchQuery && {
            $or: [
              {
                "userDetails.fullNameorCompanyName": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
              { "userDetails.phone": { $regex: searchQuery, $options: "i" } },
              {
                "userDetails.userUniqueId": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
              {
                "userDetails.logCreatedDate": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
              { postUniqueId: { $regex: searchQuery, $options: "i" } },
              { logCreatedDate: { $regex: searchQuery, $options: "i" } },
              {
                "userDetails.isStartupOrInvestor": {
                  $regex: searchQuery,
                  $options: "i",
                },
              },
            ],
          }),
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          postUniqueId: 1,
          //userId: 1,
          image: 1,
          postBlockedReason: 1,
          description: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
          userObjectId: "$userDetails._id",
          userName: "$userDetails.fullNameorCompanyName",
          userUniqueId: "$userDetails.userUniqueId",
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userDesignation: "$userDetails.designationorCompanytype",
          userCity: "$userDetails.city",
          userIsStartupOrInvestor: "$userDetails.isStartupOrInvestor",
        },
      },
      {
        $sort: {
          logModifiedDate: -1,
        },
      },
    ]);
    console.log("Matched posts:", posts);

    const blockedPostsCount = posts.length;
    let postExcell = [];
    posts.map((val) => {
      let obj = {
        date: val.date,
        time: val.time,
        postUniqueId: val.postUniqueId,
        description: val.description,
        postBlockedReason: val.postBlockedReason,
        userName: val.userName,
        userUniqueId: val.userUniqueId,
        userEmail: val.userEmail,
        userPhone: val.userPhone,
        userDesignation: val.userDesignation,
        userCity: val.userCity,
        userIsStartupOrInvestor: val.userIsStartupOrInvestor,
      };

      postExcell.push(obj);
    });

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      data: posts,
      postExcell: postExcell,
      blockedPostsCount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get post by id for admin || ------------------- get by id---------------------||
exports.getuploadedpostbyuserforadmin = async function (req, res) {
  try {
    const posts = await userPostsModel.aggregate([
      {
        $match: {
          isdeleted: "No",
          _id: new mongoose.Types.ObjectId(req.body.id),
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
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "likeposts",
          localField: "_id",
          foreignField: "postId",
          as: "likepost",
        },
      },
      {
        $lookup: {
          from: "sharedposts",
          localField: "_id",
          foreignField: "postId",
          as: "sharedpost",
        },
      },
      {
        $lookup: {
          from: "saveposts",
          localField: "_id",
          foreignField: "postId",
          as: "savepost",
        },
      },
      {
        $lookup: {
          from: "commentposts",
          localField: "_id",
          foreignField: "postId",
          as: "commentpost",
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          image: 1,
          postUniqueId: 1,
          description: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,

          // userName: "$userDetails.fullNameorCompanyName",
          // userUniqueId: "$userDetails.userUniqueId",
          // email: "$userDetails.email",
          // phone: "$userDetails.phone",
          // designation: "$userDetails.designationorCompanytype",
          // city: "$userDetails.city",
          userName: "$userDetails.fullNameorCompanyName",
          userUniqueId: "$userDetails.userUniqueId",
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userDesignation: "$userDetails.designationorCompanytype",
          userCity: "$userDetails.city",
          userIsStartupOrInvestor: "$userDetails.isStartupOrInvestor",
          likeCount: { $size: "$likepost" },
          sharedCount: { $size: "$sharedpost" },
          saveCount: { $size: "$savepost" },
          saveComment: { $size: "$commentpost" },

          // likepost: 1, // Include like post documents
          // sharedpost: 1, // Include shared post documents
          // savepost: 1, // Include saved post documents
          // commentpost: 1, // Include comment post documents
        },
      },
    ]);

    return res
      .status(200)
      .json({ success: true, message: "Data retrieved successfully", posts });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//TO BLOCK THE POST BY ADMIN
exports.deleteuseruploadedpostsbyadmin = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // Update the post to mark it as deleted
    const deletedpost = await userPostsModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          //isdeleted: "Yes",
          isblocked: true,
          //deletedBy: "admin",
          postBlockedReason: req.body.postBlockedReason,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (deletedpost) {
      // Send notification to the user about the deleted post
      // await notificationUtil.createNotification({
      //   sendTo: "User",
      //   userList: [deletedpost.userId], // Send to the userId associated with the post
      //   subject: "Post Deleted",
      //   description: "Your post has been deleted by the admin.",
      // });

      res
        .status(200)
        .json({ success: true, message: "Post has been blocked successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};


// description: `Your post has been deleted by the admin. Details:
//                       - Description: ${deletedpost.description}
//                       - Image: ${deletedpost.image ? deletedpost.image : 'No image available'}`,

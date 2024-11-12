// importing models
const userPostsModel = require("../../model/userPosts");
const userModel = require("../../model/user");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

//delete posts uploaded by admin
exports.deleteuseruploadedpostsbyadmin = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const deletedpost = await userPostsModel.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          isdeleted: "Yes",
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (deletedpost) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get all posts for admin which are not deleted
exports.getalluserpostsforadmin = async function (req, res) {
  try {
    const posts = await userPostsModel.aggregate([
      {
        $match: { isdeleted: "No" },
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
        $match: {
          "userDetails.isdeleted": "No",
        //  "userDetails.isStartupOrInvestor": req.body.isStartupOrInvestor,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          //userId: 1,
          image: 1,
          description: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
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

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      data: posts,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get all deleted posts for admin
exports.getalluserdeletedpostsforadmin = async function (req, res) {
  try {
    const posts = await userPostsModel.aggregate([
      {
        $match: { isdeleted: "Yes" },
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
        $match: {
          "userDetails.isdeleted": "No",
          "userDetails.isStartupOrInvestor": req.body.isStartupOrInvestor,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          //userId: 1,
          image: 1,
          description: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
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

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      data: posts,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get post by id for admin
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

/*
exports.deleteuseruploadedpostsbyadmin = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // Update the post to mark it as deleted
    const deletedpost = await userPostsModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          isdeleted: "Yes",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (deletedpost) {
      // Send notification to the user about the deleted post
      await notificationUtil.createNotification({
        sendTo: "User",
        userList: [deletedpost.userId], // Send to the userId associated with the post
        subject: "Post Deleted",
        description: "Your post has been deleted by the admin.",
      });

      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};
*/

// description: `Your post has been deleted by the admin. Details:
//                       - Description: ${deletedpost.description}
//                       - Image: ${deletedpost.image ? deletedpost.image : 'No image available'}`,

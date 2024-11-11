// importing models
const userPostsModel = require("../../model/userPosts");
const userModel = require("../../model/user");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

//delete posts uploaded by admin
exports.deleteuseruploadedpostsbyadmin = async function (req, res) {
  try {
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

//get all posts for admin
exports.getalluserpostsforadmin = async function (req, res) {
  try {
    const posts = await userPostsModel.aggregate([
      {
        $match: { isDelete: "No" },
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
          email: "$userDetails.email",
          phone: "$userDetails.phone",
          designation: "$userDetails.designationorCompanytype",
          city: "$userDetails.city",
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
        $match: { isDelete: "Yes" },
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
          email: "$userDetails.email",
          phone: "$userDetails.phone",
          designation: "$userDetails.designationorCompanytype",
          city: "$userDetails.city",
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

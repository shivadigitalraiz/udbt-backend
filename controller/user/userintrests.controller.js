  // importing models
const intrestsModel = require("../../model/intrests");
const { DateTime } = require("luxon");
const contactusModel = require("../../model/contactus");
const aboutusModel = require("../../model/aboutus");
const userModel = require("../../model/user");
const mongoose = require("mongoose");
const savePostsModel = require("../../model/savePosts");

//get all intrests
exports.getallintrests = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }],
      };
    }

    condition.status = "active";
    console.log(condition);

    const intrests = await intrestsModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (intrests) {
      res.status(200).json({
        success: true,
        message: "Intrest's have been retrived successfully ",
        intrests: intrests,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

exports.getcontactusandaboutus = async function (req, res) {
  try {
    const contactus = await contactusModel.findOne({});

    const aboutus = await aboutusModel.findOne({});

    res.status(200).json({
      success: true,
      message: "Data retrived successfully",
      contactus,
      aboutus,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//-02-12-2024
exports.getsavedpostforme = async function (req, res) {
  try {
    const { page, length = 10 } = req.body; // Default items per page to 10

    const itemsPerPage = Number(length);
    const skip = page * itemsPerPage;

    const userId = req.userId;
    const usersavedpostsPipeline = [
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
          postUniqueId: "$userpost.postUniqueId",
          postDescription: "$userpost.description",
          likeCount: { $size: "$likes" },
          commentCount: { $size: "$comments" },
        },
      },
      { $sort: { date: -1 } }, // Sort by date descending
    ];

    if (page !== undefined) {
      usersavedpostsPipeline.push(
        {
          $sort: {
            logCreatedDate: -1,
          },
        },
        { $skip: skip },
        { $limit: itemsPerPage }
      );
    }

    const usersavedposts = await savePostsModel.aggregate(
      usersavedpostsPipeline
    );

    const savedPostsCount = await savePostsModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });
    return res.status(200).json({
      success: true,
      message: "Data retrived successfully",
      usersavedposts,
      savedPostsCount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

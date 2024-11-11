//importing models
const userModel = require("../../model/user");
const policieModel = require("../../model/policies");
const userPostsModel = require("../../model/userPosts");
const { DateTime } = require("luxon");

exports.getPolicies = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const policy = await policieModel.findOne({});

    if (policy === null) {
      const policyObj = new policieModel({
        privacyPolicy: "",
        termsAndCondition: "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });
      const savepolicy = await policyObj.save();
      if (savepolicy) {
        return res.status(200).json({
          success: true,
          message: "Policies data have been retrieved successfully",
          policy: savepolicy ?? {},
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Policies  data has been retrieved successfully",
        policy: policy ?? {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//home screen api for uploaded posts by all
// exports.getalluploadedpostsbyall = async function (req, res) {
//   try {
//     const posts = await userPostsModel.aggregate([
//       {
//         $match: { isdeleted: "No" },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//       {
//         $unwind: "$userDetails",
//       },
//       {
//         $lookup: {
//           from: "likeposts",
//           localField: "_id",
//           foreignField: "postId",
//           as: "likepost",
//         },
//       },
//       {
//         $lookup: {
//           from: "sharedposts",
//           localField: "_id",
//           foreignField: "postId",
//           as: "sharedpost",
//         },
//       },
//       {
//         $lookup: {
//           from: "saveposts",
//           localField: "_id",
//           foreignField: "postId",
//           as: "savepost",
//         },
//       },

//       {
//         $lookup: {
//           from: "commentposts",
//           localField: "_id",
//           foreignField: "postId",
//           as: "commentpost",
//         },
//       },

//       {
//         $project: {
//           _id: 1,
//           date: 1,
//           time: 1,
//           //userId: 1,
//           image: 1,
//           description: 1,
//           logCreatedDate: 1,
//           logModifiedDate: 1,
//           userName: "$userDetails.fullNameorCompanyName",
//           userUniqueId: "$userDetails.userUniqueId",
//           email: "$userDetails.email",
//           phone: "$userDetails.phone",
//           designation: "$userDetails.designationorCompanytype",
//           city: "$userDetails.city",
//           likeCount: { $size: "$likepost" },
//           sharedCount: { $size: "$sharedpost" },
//           saveCount: { $size: "$savepost" },
//           saveComment: { $size: "$commentpost" },
//         },
//       },
//     ]);

//     return res
//       .status(200)
//       .json({ success: true, message: "Data retrived successfully", posts });
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };
exports.getalluploadedpostsbyall = async function (req, res) {
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
          userName: "$userDetails.fullNameorCompanyName",
          userUniqueId: "$userDetails.userUniqueId",
          email: "$userDetails.email",
          phone: "$userDetails.phone",
          designation: "$userDetails.designationorCompanytype",
          city: "$userDetails.city",
          likeCount: { $size: "$likepost" },
          sharedCount: { $size: "$sharedpost" },
          saveCount: { $size: "$savepost" },
          saveComment: { $size: "$commentpost" },
          likepost: 1, // Include like post documents
          sharedpost: 1, // Include shared post documents
          savepost: 1, // Include saved post documents
          commentpost: 1, // Include comment post documents
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

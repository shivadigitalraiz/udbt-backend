//importing models
const userModel = require("../../model/user");
const policieModel = require("../../model/policies");
const userPostsModel = require("../../model/userPosts");
const { DateTime } = require("luxon");
const savePostsModel = require("../../model/savePosts");
const commentPostsModel = require("../../model/userComentPosts");
const followersModel = require("../../model/userfollower");
const mongoose = require("mongoose");
const likedPostsModel = require("../../model/userLikeposts");

//GET POLICIES FOR USER
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
exports.getalluploadedpostsbyall = async function (req, res) {
  try {
    const searchQuery = req.query.searchQuery || "";
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
          ...(searchQuery
            ? {
                "userDetails.fullNameorCompanyName": {
                  $regex: searchQuery,
                  $options: "i",
                },
              }
            : {}),
        },
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
          userEmail: "$userDetails.email",
          userPhone: "$userDetails.phone",
          userDesignation: "$userDetails.designationorCompanytype",
          userCity: "$userDetails.city",
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

//GET ALL INVESTORS FOR HOME PAGE
exports.getallinvestorsforuser = async function (req, res) {
  try {
    // Step 1: Extract searchQuery from request
    const { searchQuery } = req.query;

    // Step 2: Build the search filter dynamically based on searchQuery
    const searchFilter = {
      status: "active",
      isdeleted: "No",
      isStartupOrInvestor: "investor",
    };

    if (searchQuery) {
      searchFilter.$or = [
        { fullNameorCompanyName: { $regex: searchQuery, $options: "i" } },
        { designationorCompanytype: { $regex: searchQuery, $options: "i" } },
        { city: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Step 3: Get all users who are active, not deleted, and are investors (with search filters if provided)
    const users = await userModel
      .find(searchFilter)
      .sort({ logCreatedDate: -1 });

    // Step 4: Fetch the related information (posts, followers, followings, saved posts, liked posts) in parallel
    const userDetails = await Promise.all(
      users.map(async (user) => {
        // Fetch posts related to the user
        const posts = await userPostsModel.find({
          userId: user._id,
          isdeleted: "No",
        });

        // Count the number of posts
        const postCount = posts.length;

        // Fetch the user's followers
        const followers = await followersModel.aggregate([
          { $match: { followingId: user._id } },
          {
            $lookup: {
              from: "users",
              localField: "followerId",
              foreignField: "_id",
              as: "followerDetails",
            },
          },
          { $unwind: "$followerDetails" },
          {
            $project: {
              follwerObjectId: "$followerDetails._id",
              followerName: "$followerDetails.fullNameorCompanyName",
              followerEmail: "$followerDetails.email",
              followingPhone: "$followerDetails.phone",
              follwerCity: "$followerDetails.city",
              date: 1,
              time: 1,
            },
          },
        ]);
        const followerCount = followers.length;

        // Fetch the user's followings
        const followings = await followersModel.aggregate([
          { $match: { followerId: user._id } },
          {
            $lookup: {
              from: "users",
              localField: "followingId",
              foreignField: "_id",
              as: "followingDetails",
            },
          },
          { $unwind: "$followingDetails" },
          {
            $project: {
              follwingObjectId: "$followingDetails._id",
              followingName: "$followingDetails.fullNameorCompanyName",
              followingEmail: "$followingDetails.email",
              followingPhone: "$followingDetails.phone",
              followingCity: "$followingDetails.city",
              date: 1,
              time: 1,
            },
          },
        ]);
        const followingCount = followings.length;

        // Fetch the user's saved posts
        const savedPosts = await savePostsModel.aggregate([
          { $match: { userId: user._id } },
          {
            $lookup: {
              from: "userposts",
              localField: "postId",
              foreignField: "_id",
              as: "savedPostDetails",
            },
          },
          { $unwind: "$savedPostDetails" },
          {
            $match: {
              "savedPostDetails.isdeleted": "No",
            },
          },
          {
            $project: {
              date: 1,
              savedPostObjectId: "$savedPostDetails._id",
              postDescription: "$savedPostDetails.description",
              postImage: "$savedPostDetails.image",
              logCreatedDate: 1,
            },
          },
        ]);
        const savedPostCount = savedPosts.length;

        // Fetch the user's liked posts
        const likedPosts = await likedPostsModel.aggregate([
          { $match: { userId: user._id } },
          {
            $lookup: {
              from: "userposts",
              localField: "postId",
              foreignField: "_id",
              as: "likedPostDetails",
            },
          },
          { $unwind: "$likedPostDetails" },
          {
            $match: {
              "likedPostDetails.isdeleted": "No",
            },
          },
          {
            $project: {
              date: 1,
              time: 1,
              likedPostObjectId: "$likedPostDetails._id",
              postDescription: "$likedPostDetails.description",
              postImage: "$likedPostDetails.image",
            },
          },
        ]);
        const likedPostCount = likedPosts.length;

        //commented posts
        const commentedPosts = await commentPostsModel.aggregate([
          { $match: { userId: user._id } },
          {
            $lookup: {
              from: "userposts",
              localField: "postId",
              foreignField: "_id",
              as: "commentedPostDetails",
            },
          },
          { $unwind: "$commentedPostDetails" },
          {
            $match: {
              "commentedPostDetails.isdeleted": "No",
            },
          },
          {
            $project: {
              date: 1,
              time: 1,
              comment: 1,
              commentedPostObjectId: "$commentedPostDetails._id",
              postDescription: "$commentedPostDetails.description",
              postImage: "$commentedPostDetails.image",
            },
          },
        ]);

        const commentedPostsCount = commentedPosts.length;

        return {
          ...user.toObject(),
          posts: posts,
          followers: followers,
          followings: followings,
          savedPosts: savedPosts,
          likedPosts: likedPosts,
          commentedPosts: commentedPosts,
          //counts
          postCount: postCount,
          savedPostCount: savedPostCount,
          likedPostCount: likedPostCount,
          followerCount: followerCount,
          followingCount: followingCount,
          commentedPostsCount: commentedPostsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: userDetails,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Something went wrong ",
    });
  }
};

//GET ALL STARTUPS @ USERS IN HOME PAGE VIEW DETAILS
exports.getallstartupsforuser = async function (req, res) {
  try {
    // Step 1: Extract searchQuery from request
    const { searchQuery } = req.query;

    // Step 2: Build the search filter dynamically based on searchQuery
    const searchFilter = {
      status: "active",
      isdeleted: "No",
      isStartupOrInvestor: "startup",
    };

    if (searchQuery) {
      searchFilter.$or = [
        { fullNameorCompanyName: { $regex: searchQuery, $options: "i" } },
        { designationorCompanytype: { $regex: searchQuery, $options: "i" } },
        { city: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Step 3: Get all users who are active, not deleted, and are investors (with search filters if provided)
    const users = await userModel
      .find(searchFilter)
      .sort({ logCreatedDate: -1 });

    // Step 4: Fetch the related information (posts, followers, followings, saved posts, liked posts) in parallel
    const userDetails = await Promise.all(
      users.map(async (user) => {
        // Fetch posts related to the user
        const posts = await userPostsModel.find({
          userId: user._id,
          isdeleted: "No",
        });

        // Count the number of posts
        const postCount = posts.length;

        // Fetch the user's followers
        const followers = await followersModel.aggregate([
          { $match: { followingId: user._id } },
          {
            $lookup: {
              from: "users",
              localField: "followerId",
              foreignField: "_id",
              as: "followerDetails",
            },
          },
          { $unwind: "$followerDetails" },
          {
            $project: {
              follwerObjectId: "$followerDetails._id",
              followerName: "$followerDetails.fullNameorCompanyName",
              followerEmail: "$followerDetails.email",
              followingPhone: "$followerDetails.phone",
              follwerCity: "$followerDetails.city",
              date: 1,
              time: 1,
            },
          },
        ]);
        const followerCount = followers.length;

        // Fetch the user's followings
        const followings = await followersModel.aggregate([
          { $match: { followerId: user._id } },
          {
            $lookup: {
              from: "users",
              localField: "followingId",
              foreignField: "_id",
              as: "followingDetails",
            },
          },
          { $unwind: "$followingDetails" },
          {
            $project: {
              followingObjectId: "$followingDetails._id",
              followingName: "$followingDetails.fullNameorCompanyName",
              followingEmail: "$followingDetails.email",
              followingPhone: "$followingDetails.phone",
              followingCity: "$followingDetails.city",
              date: 1,
              time: 1,
            },
          },
        ]);
        const followingCount = followings.length;

        // Fetch the user's saved posts
        const savedPosts = await savePostsModel.aggregate([
          { $match: { userId: user._id } },
          {
            $lookup: {
              from: "userposts",
              localField: "postId",
              foreignField: "_id",
              as: "savedPostDetails",
            },
          },
          { $unwind: "$savedPostDetails" },
          {
            $match: {
              "savedPostDetails.isdeleted": "No",
            },
          },
          {
            $project: {
              date: 1,
              savedPostObjectId: "$savedPostDetails._id",
              postDescription: "$savedPostDetails.description",
              postImage: "$savedPostDetails.image",
              logCreatedDate: 1,
            },
          },
        ]);
        const savedPostCount = savedPosts.length;

        // Fetch the user's liked posts
        const likedPosts = await likedPostsModel.aggregate([
          { $match: { userId: user._id } },
          {
            $lookup: {
              from: "userposts",
              localField: "postId",
              foreignField: "_id",
              as: "likedPostDetails",
            },
          },
          { $unwind: "$likedPostDetails" },
          {
            $match: {
              "likedPostDetails.isdeleted": "No",
            },
          },
          {
            $project: {
              date: 1,
              likedPostObjectId: "$likedPostDetails._id",
              postDescription: "$likedPostDetails.description",
              postImage: "$likedPostDetails.image",
            },
          },
        ]);
        const likedPostCount = likedPosts.length;

        const commentedPosts = await commentPostsModel.aggregate([
          { $match: { userId: user._id } },
          {
            $lookup: {
              from: "userposts",
              localField: "postId",
              foreignField: "_id",
              as: "commentedPostDetails",
            },
          },
          { $unwind: "$commentedPostDetails" },
          {
            $match: {
              "commentedPostDetails.isdeleted": "No",
            },
          },
          {
            $project: {
              date: 1,
              time: 1,
              comment: 1,
              commentedPostObjectId: "$commentedPostDetails._id",
              postDescription: "$commentedPostDetails.description",
              postImage: "$commentedPostDetails.image",
            },
          },
        ]);

        const commentedPostsCount = commentedPosts.length;

        return {
          ...user.toObject(),
          posts: posts,
          followers: followers,
          followings: followings,
          savedPosts: savedPosts,
          likedPosts: likedPosts,
          commentedPosts: commentedPosts,
          //counts
          postCount: postCount,
          savedPostCount: savedPostCount,
          likedPostCount: likedPostCount,
          followerCount: followerCount,
          followingCount: followingCount,
          commentedPostsCount: commentedPostsCount,
        };
      })
    );

    // Step 5: Return all the user details directly as an array of user objects
    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: userDetails,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Something went wrong ",
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
          postUniqueId: 1,
          description: 1,
          likeCount: { $size: "$likes" },
          commentCount: { $size: "$comments" }, // Coun
        },
      },
    ]);

    const uploadedPostsCount = userUploadedposts.length;

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
          postUniqueId: "$userpost.postUniqueId",
          postDescription: "$userpost.description",
          likeCount: { $size: "$likes" }, // Count of likes for each saved post
          commentCount: { $size: "$comments" },
        },
      },
    ]);

    const savedPostsCount = usersavedposts.length;

    const userlikeposts = await likedPostsModel.aggregate([
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

    // Get the count of userFollowers
    const userFollowersCount = userFollowers.length;

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

    // Get the count of userFollowers
    const userFollowingsCount = userFollowings.length;

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
      //counts
      userFollowersCount,
      userFollowingsCount,
      uploadedPostsCount,
      savedPostsCount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

/*
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
*/

// exports.getallinvestorsforuser = async function (req, res) {
//   try {
//     // Step 1: Get all users who are active, not deleted, and are investors
//     const users = await userModel
//       .find({
//         status: "active",
//         isdeleted: "No",
//         isStartupOrInvestor: "investor",
//       })
//       .sort({ logCreatedDate: -1 });

//     // Step 2: Fetch the related information (posts, followers, followings, saved posts, liked posts) in parallel
//     const userDetails = await Promise.all(
//       users.map(async (user) => {
//         // Fetch posts related to the user
//         const posts = await userPostsModel.find({
//           userId: user._id,
//           isdeleted: "No",
//         });
//         // .select("description image date time");

//         // Count the number of posts
//         const postCount = posts.length;

//         // Fetch the user's followers
//         const followers = await followersModel.aggregate([
//           { $match: { followingId: user._id } },
//           {
//             $lookup: {
//               from: "users",
//               localField: "followerId",
//               foreignField: "_id",
//               as: "followerDetails",
//             },
//           },
//           { $unwind: "$followerDetails" },
//           {
//             $project: {
//               followerName: "$followerDetails.fullNameorCompanyName",
//               followerEmail: "$followerDetails.email",
//               followingPhone: "$followerDetails.phone",
//               date: 1,
//             },
//           },
//         ]);
//         const followerCount = followers.length;

//         // Fetch the user's followings
//         const followings = await followersModel.aggregate([
//           { $match: { followerId: user._id } },
//           {
//             $lookup: {
//               from: "users",
//               localField: "followingId",
//               foreignField: "_id",
//               as: "followingDetails",
//             },
//           },
//           { $unwind: "$followingDetails" },
//           {
//             $project: {
//               followingName: "$followingDetails.fullNameorCompanyName",
//               followingEmail: "$followingDetails.email",
//               followingPhone: "$followingDetails.phone",
//               date: 1,
//             },
//           },
//         ]);
//         const followingCount = followings.length;

//         // Fetch the user's saved posts
//         const savedPosts = await savePostsModel.aggregate([
//           { $match: { userId: user._id } },
//           {
//             $lookup: {
//               from: "userposts",
//               localField: "postId",
//               foreignField: "_id",
//               as: "savedPostDetails",
//             },
//           },
//           { $unwind: "$savedPostDetails" },
//           {
//             $match: {
//               "savedPostDetails.isdeleted": "No", // Apply filter for isdeleted: "No"
//             },
//           },
//           {
//             $project: {
//               date: 1,
//               postDescription: "$savedPostDetails.description",
//               postImage: "$savedPostDetails.image",
//               logCreatedDate: 1,
//             },
//           },
//         ]);
//         const savedPostCount = savedPosts.length;

//         // Fetch the user's liked posts
//         const likedPosts = await likedPostsModel.aggregate([
//           { $match: { userId: user._id } },
//           {
//             $lookup: {
//               from: "userposts",
//               localField: "postId",
//               foreignField: "_id",
//               as: "likedPostDetails",
//             },
//           },
//           { $unwind: "$likedPostDetails" },
//           {
//             $match: {
//               "likedPostDetails.isdeleted": "No", // Apply filter for isdeleted: "No"
//             },
//           },
//           {
//             $project: {
//               date: 1,
//               postDescription: "$likedPostDetails.description",
//               postImage: "$likedPostDetails.image",
//             },
//           },
//         ]);
//         const likedPostCount = likedPosts.length;

//         // Return the complete user object along with the related details
//         return {
//           ...user.toObject(), // Spreads the user object fields directly
//           posts: posts,
//           followers: followers,
//           followings: followings,
//           savedPosts: savedPosts,
//           likedPosts: likedPosts,
//           postCount: postCount,
//           savedPostCount: savedPostCount,
//           likedPostCount: likedPostCount,
//           followerCount: followerCount,
//           followingCount: followingCount,
//         };
//       })
//     );

//     // Step 3: Return all the user details directly as an array of user objects
//     return res.status(200).json({
//       success: true,
//       message: "User details retrieved successfully",
//       data: userDetails, // Directly return the user details array
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({
//       success: false,
//       message: "Something went wrong while fetching user details",
//     });
//   }
// };

// importing models
const userModel = require("../../model/user");
const userPostsModel = require("../../model/userPosts");
const { DateTime } = require("luxon");
//const notificationUtil = require("../../utils/notificationUtills");

//add
exports.adduseruploadposts = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const user = await userModel.findOne({ _id: req.userId });

    // // User unique ID generation logic
    // const latestUser = await userPostsModel
    //   .findOne()
    //   .sort({ postUniqueId: -1 });
    // const bookingNum =
    //   latestUser && latestUser.postUniqueId
    //     ? parseInt(latestUser.postUniqueId.substring(3)) + 1
    //     : 1;
    // const cId = String(bookingNum).padStart(5, "0");
    // const postUniqueId = "POST" + cId;

    // User unique ID generation logic
    const latestUser = await userPostsModel
      .findOne()
      .sort({ postUniqueId: -1 });
    let bookingNum = 1;

    if (
      latestUser &&
      latestUser.postUniqueId &&
      latestUser.postUniqueId.startsWith("POST")
    ) {
      // Extract the numeric part after "POST" and increment
      const lastNumber = parseInt(latestUser.postUniqueId.substring(4), 10);
      bookingNum = lastNumber + 1;
    }

    const cId = String(bookingNum).padStart(5, "0"); // Pad the number to 5 digits
    const postUniqueId = "POST" + cId;

    const userPostObj = new userPostsModel({
      date: logDate.slice(0, 10),
      postUniqueId: postUniqueId,
      time,
      description: req.body.description,
      image: req.file ? req.file.path : "",
      userId: req.userId,
      userName: user ? user.fullNameorCompanyName : "",
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    // Save the support object
    const uploadposts = await userPostObj.save();
    if (uploadposts) {
      res.status(200).json({
        success: true,
        message: "Post has been uploaded successfully",
      });

      // await notificationUtil.createNotification({
      //   sendTo: "User",
      //   userList: req.userId,
      //   subject: "Request Successful",
      //   description: `Thank you for using Lead interio.`,
      //   // subject: req.body.title,
      //   // description: req.body.description,
      // });
    } else {
      res.status(400).json({ success: false, message: "Please try again" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//get all
exports.getalluseruploadposts = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ description: regex }],
      };
    }
    condition.userId = req.userId;
    console.log(condition);

    const uploadposts = await userPostsModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (uploadposts) {
      res.status(200).json({
        success: true,
        message: "Upload posts's have been retrived successfully ",
        uploadposts: uploadposts,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// edit
exports.edituseruploadedpost = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const user = await userModel.findOne({ _id: req.userId });

    const userPosts = await userPostsModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          image: req.file ? req.file.path : console.log("No img"),
          description: req.body.description,
          userId: req.userId,
          userName: user ? user.name : "",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );
    if (userPosts) {
      res.status(200).json({
        success: true,
        message: "Posts has been updated",
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

exports.deleteuseruploadedposts = async function (req, res) {
  try {
    // const deletedpost = await userPostsModel.findOneAndDelete({
    //   _id: req.params.id,
    // });

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

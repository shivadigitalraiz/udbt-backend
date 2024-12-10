// importing models
const userModel = require("../../model/user");
const userSupportModel = require("../../model/usersupport");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
//const notificationUtil = require("../../utils/notificationUtills");

//add
exports.addusersupport = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const user = await userModel.findOne({ _id: req.userId });

    // Count the number of documents
    const count = await userSupportModel.countDocuments();
    const data = await userSupportModel.findOne().sort({ _id: -1 });
    const bookingNum =
      count > 0 ? (parseInt(data?.ticketId?.substring(6)) || 0) + 1 : 1;
    const cId = String(bookingNum).padStart(5, "0");
    const ticketId = "UDBT" + cId;

    const userObj = new userSupportModel({
      date: logDate.slice(0, 10),
      time,
      ticketId: ticketId,
      title: req.body.title,
      description: req.body.description,
      image: req.file ? req.file.path : "",
      reply: req.body.reply,
      reason: req.body.reason,
      userId: req.userId,   
      userName: user ? user.name : "",
      status: req.body.status,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    // Save the support object
    const saveduser = await userObj.save();
    if (saveduser) {
      res
        .status(200)
        .json({ success: true, message: "Support added successfully" });

      // await notificationUtil.createNotification({
      //   sendTo: "User",
      //   userList: req.userId,
      //   subject: "Request Successful",
      //   description: `Thank you for using Lead interio.`,
      //   // subject: req.body.title,
      //   // description: req.body.description,
      // });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to create support" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

// getAll USER Requests
exports.getAllUserRequests = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ title: regex }, { reason: regex }, { description: regex }],
      };
    }
    condition.userId = req.userId;
    console.log(condition);
    // Fetching only specific fields from the setting collection
    //   const contactDetails = await settingModel.findOne(
    //     {},
    //     { officePhonenumber: 1 }
    //   );

    const userRequest = await userSupportModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (userRequest) {
      res.status(200).json({
        success: true,
        message: "UserRequest's has been retrived successfully ",
        userRequest: userRequest,
        //contactDetails: contactDetails,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// exports.getAllUserRequests = async function (req, res) {
//   try {
//     let condition = {};
//     let regex = new RegExp(req.query.searchQuery, "i");

//     // Build the condition for search
//     if (req.query.searchQuery !== "") {
//       condition = {
//         $or: [{ title: regex }, { reason: regex }, { description: regex }],
//       };
//     }

//     // Add userId to the condition
//     condition.userId = req.userId;
//     console.log(condition);

//     // Fetch user requests based on the condition
//     const userRequest = await userSupportModel.find(condition).sort({
//       logCreatedDate: -1,
//     });

//     // Fetch purchased leads based on the same userId condition
//     const purchasedLeads = await purchaseleadsModel.find({
//       userId: req.userId,
//     });


//     if (userRequest) {
//       res.status(200).json({
//         success: true,
//         message: "User requests have been retrieved successfully",
//         userRequest: userRequest,
//         purchasedLeads: purchasedLeads,
//         // contactDetails: contactDetails,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: "Something went wrong" });
//   }
// };

// delete user support
exports.deleteusersupport = async function (req, res) {
  try {
    const service = await userSupportModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (service) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: "false", message: "Something went wrong" });
  }
};



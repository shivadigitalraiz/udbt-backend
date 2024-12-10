// importing models
const notificationModel = require("../../model/notification");
const { DateTime } = require("luxon");
const notificationUtil = require("../../utils/notificationUtills");

exports.addNotification = async function (req, res) {
  try {
    console.log(req.body);

    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    await notificationUtil.createNotification({
      // sendTo: "Vendor",
      // userList: req.body.users[0].value,
      // subject: "Notification",
      // description: "Notification has been sent",

      sendTo: req.body.sendTo,
      userList: req.body.users,
      subject: req.body.title,
      description: req.body.description,
    });
    // const notifcationObj = new notificationModel({
    //   date: logDate.slice(0, 10),
    //   time,
    //   title: req.body.title,
    //   sendTo: req.body.sendTo,
    //   description: req.body.description,
    //   users: req.body.users,
    //   logCreatedDate: logDate,
    //   logModifiedDate: logDate,
    // });

    // const saveNotification = await notifcationObj.save();

    // if (saveNotification) {
    //   res.status(200).json({ success: true, message: "Added successfully" });
    // } else {
    //   res.status(400).json({ success: false, message: "Please try again" });
    // }

    //04-11-24
    res.status(200).json({
      success: true,
      message: "Notification has been added successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: false, message: "Something went wrong..!" });
  }
};

// // get notifications
// exports.getAllNotifications = async function (req, res) {
//   try {
//     let condition = {};
//     let regex = new RegExp(req.query.searchQuery, "i");
//     if (req.query.searchQuery !== "") {
//       condition = {
//         $or: [{ title: regex }, { sendTo: regex }],
//       };
//     }
//     condition.isdeleted = "No";
//     const notifications = await notificationModel.find(condition).sort({
//       logCreatedDate: -1,
//     });
//     if (notifications) {
//       res.status(200).json({
//         message: "Successful",
//         notifications: notifications,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ success: false, message: "Something went wrong" });
//   }
// };

// get notifications
exports.getAllNotifications = async function (req, res) {
  try {
    // Define the condition for fetching notifications
    let condition = { isdeleted: "No" }; // Set isdeleted condition as default
    let regex = new RegExp(req.query.searchQuery, "i");

    // Include search query in condition if it exists
    if (req.query.searchQuery) {
      condition.$or = [
        { title: regex },
        { sendTo: regex },
        { description: regex },
      ];
    }

    // Fetch notifications
    const notifications = await notificationModel
      .find(condition)
      .sort({ logCreatedDate: -1 });

    // Return notifications or an empty array if none found
    res.status(200).json({
      message: "Successful",
      notifications: notifications || [], // Use logical OR to return notifications or an empty array
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// delete notification
exports.deletenotification = async function (req, res) {
  try {
    const notification = await notificationModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (notification) {
      res.status(200).json({ message: "Notifications have been deleted" });
    } else {
      res.status(400).json({ message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

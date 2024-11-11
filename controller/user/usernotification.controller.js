// importing models
const userModel = require("../../model/user");
const notificationModel = require("../../model/notification");
const mongoose = require("mongoose");

//update notification_bell status controller
exports.updateNotificationBell = async (req, res) => {
  try {
    const notification_bell = await userModel
      .findByIdAndUpdate({ _id: req.userId }, [
        { $set: { notification_bell: { $eq: [false, "$notification_bell"] } } },
      ])
      .select("notification_bell");

    if (notification_bell) {
      const notification = await userModel.findById(
        { _id: req.userId },
        { notification_bell: 1 }
      );

      return res.status(200).json({
        success: true,
        message: "Updated Successfully",
        notification,
      });
    } else {
      return res.status(400).json({ success: false, messsage: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

//get notifcation status
exports.getnotificationstatus = async function (req, res) {
  try {
    console.log(req.userId);
    const user = await userModel.findOne(
      { _id: req.userId },
      { notification_bell: 1 }
    );
    if (user) {
      res.status(200).json({ success: true, message: "Success", user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// getall notificationsby userId
exports.getAllNotificationbyUserId = async function (req, res) {
  // try {
  console.log(req.userId);

  const notifResult = await notificationModel
    .find(
      {
        users: { $in: [req.userId] },
      },
      { users: 0 }
    )
    .sort({ logCreatedDate: -1 });

  res.status(200).json({ message: "successs", notifResult });
  // } catch (err) {
  //   res.status(400).json({ message: "Bad request" });
  // }
};

// delete notification
exports.deleteNotification = async function (req, res) {
  try {
    const userId = req.userId;
    const notifyResult = await notificationModel.findOne({
      _id: req.body._id,
    });
    if (!notifyResult) {
      return res
        .status(400)
        .json({ success: false, message: "Notification not found" });
    }
    let array = notifyResult.users;
    const index = array.findIndex(
      (user) => user.toString() === userId.toString()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found in the notification",
      });
    }

    // Splice array only when the user is found
    array.splice(index, 1); // Remove one item at the found index

    const notificationResult = await notificationModel.findOneAndUpdate(
      { _id: req.body._id },
      { users: array },
      { new: true }
    );
    if (!notificationResult) {
      return res.status(400).json({ success: false, message: "Bad request" });
    }
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

exports.deleteUserAllNotification = async function (req, res) {
  // try {
  console.log("UserId :", req.userId);
  const notifications = await notificationModel.find();

  let notificationResult = null;
  for (let notif of notifications) {
    let userid = req.userId;

    let array = notif.users;

    console.log(array);

    const index = array.indexOf(userid);
    let newArr;
    if (index > -1) {
      // only splice array when item is found
      newArr = array.splice(index, 1); // 2nd parameter means remove one item only
    }

    console.log(newArr);

    notificationResult = await notificationModel.findOneAndUpdate(
      { _id: notif._id },
      { users: array }
    );
  }

  if (notificationResult) {
    return res
      .status(200)
      .json({ message: "Notifications removed successfully" });
  }
};

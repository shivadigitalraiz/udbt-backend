// importing models
const userModel = require("../../model/user");
const usersupportModel = require("../../model/usersupport");
//const notificationUtil = require("../../utils/notificationUtills");
const { DateTime } = require("luxon");

//get all the issues|| queries done by all the users
exports.getQueries = async (req, res) => {
  try {
    let condition = {};

    if (req.body.status) {
      condition.status = req.body.status;
    }

    const searchQuery = req.query.searchQuery || req.body.searchQuery;

    // // Check if searchQuery is not empty and build the condition
    // if (searchQuery) {
    //   const regex = new RegExp(searchQuery, "i");
    //   condition = {
    //     $or: [{ "user.name": regex }],
    //   };
    // }

    // If searchQuery is provided, build the regex condition
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");

      // Use $and to combine both conditions
      if (condition.status) {
        condition = {
          $and: [
            { status: condition.status }, // Include status condition
            { $or: [{ "user.name": regex }] }, // Include searchQuery condition
          ],
        };
      } else {
        // If no status is provided, only apply searchQuery
        condition = {
          $or: [{ "user.name": regex }],
        };
      }
    }

    const queries = await usersupportModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: condition,
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          date: 1,
          time: 1,
          ticketId: 1,
          title: 1,
          reason: 1,
          reply: 1,
          description: 1,
          image: 1,
          status: 1,
          logCreatedDate: 1,
          logModifiedDate: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          userMobile: "$user.phone",
        },
      },
      {
        $sort: {
          logCreatedDate: -1,
        },
      },
    ]);
    if (queries) {
      res.status(200).json({
        message: " details  has been fetched",
        count: queries.length,
        data: queries,
      });
    } else {
      res.status(200).json({ message: "no queries" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//update user status
exports.upateusersstatussupport = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    console.log("req.body:", req.body);

    const upStore = await usersupportModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        reply: req.body.reply,
        status: req.body.status,
        logModifiedDate: logDate,
      },
      {
        new: true,
      }
    );

    if (upStore) {
      console.log(upStore, "upsttttttttttore");
      res.status(200).json({ success: true, message: "Updated successfully" });

      // await notificationUtil.createNotification({
      //   sendTo: "User",
      //   userList: upStore.userId,
      //   subject: "Support Issue Solved",
      //   description: `Your support issue has been solved. Please check the app for more details.`,
      // });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to update support" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

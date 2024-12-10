/** @format */

const notificationModel = require("../model/notification");
const customerModel = require("../model/user");

const adminModel = require("../model/admin");
const { DateTime } = require("luxon");

const FCM = require("fcm-node");

const userFcmFunction = require("./fcmFunction");

exports.createNotification = async function (params) {
  const istDateTime = DateTime.now().setZone("Asia/Kolkata");
  const logDate = istDateTime.toISO({ includeOffset: true });
  const time = istDateTime.toFormat("hh:mm a");

  let message;
  console.log(
    {
      sendTo: params.sendTo,
      title: params.subject,
      description: params.description,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
      date: logDate.slice(0, 10),
      time: time,
    },
    "parameters"
  );

  switch (params.sendTo) {
    case "Admin":
      let servicemanUsers = [];
      let adminFcms = [];
      let servicemansData = await adminModel.find(
        { status: "active", notification_bell: true },
        { _id: 1, fcmToken: 1 }
      );

      if (params.userList == "All") {
        servicemansData.map((item) => {
          servicemanUsers.push(item._id.toString());
          adminFcms.push(item.fcmToken);
        });
      } else {
        const showSrvMan = await adminModel.find(
          {
            $and: [{ _id: { $in: params.userList } }, { status: "active" }],
          },
          { _id: 1, fcmToken: 1 }
        );

        showSrvMan.map((item) => {
          servicemanUsers.push(item._id.toString());
          adminFcms = [item.fcmToken];
        });
      }

      console.log(servicemanUsers);
      console.log(adminFcms, "adminFcms");
      message = {
        registration_ids: adminFcms,
        notification: {
          title: params.subject,
          body: params.description,
        },
      };
      adminFcm.send(message, function (err, response) {
        if (err) {
          console.log("Failed to send notification:", err);
        } else {
          console.log(
            "Successfully sent notification with response:",
            response
          );
        }
      });

      new notificationModel({
        sendTo: params.sendTo,
        users: servicemanUsers,
        isRead: servicemanUsers,
        title: params.subject,
        description: params.description,
        logCreatedDate: logDate,
        logModifiedDate: logDate,
        date: logDate.slice(0, 10),
        time: time,
      }).save();
      break;

    case "User":
      let customerUsers = [];
      let customerFCMs = [];
      let customerData = await customerModel.find({
        notification_bell: true,
        $and: [
          {
            fcmtoken: {
              $nin: [""],
            },
          },
          {
            fcmtoken: {
              $exists: true,
            },
          },
        ],
      });

      if (params.userList == "All") {
        customerData.map((item) => {
          if (item.notification_bell == true) {
            customerUsers.push(item._id.toString());
            customerFCMs.push(item.fcmtoken);
          } else {
            console.log("No user");
          }
        });
      } else {
        const showAgent = await customerModel.find({
          $and: [
            { _id: { $in: params.userList } },
            {
              fcmtoken: {
                $nin: [""],
              },
            },
            {
              fcmtoken: {
                $exists: true,
              },
            },
            {
              notification_bell: true,
            },
          ],
        });

        showAgent.map((item) => {
          if (item.notification_bell == true) {
            customerUsers.push(item._id.toString());
            customerFCMs.push(item.fcmtoken);
          } else {
            console.log("No user");
          }
        });
      }

      console.log(customerFCMs, "customerFCMs");

      for (const token of customerFCMs) {
        const accessToken = await userFcmFunction.getAccessToken();
        const message = {
          message: {
            token: token,
            notification: {
              title: params.subject,
              body: params.description,
            },
          },
        };

        userFcmFunction.sendMessage(
          accessToken,
          message,
          function (err, response) {
            if (err) {
              console.log("Failed to send notification:", err.message);
            } else {
              console.log(
                "Successfully sent notification with response:",
                response
              );
            }
          }
        );

        new notificationModel({
          sendTo: params.sendTo,
          users: customerUsers,
          isRead: customerUsers,
          title: params.subject,
          description: params.description,
          logCreatedDate: logDate,
          logModifiedDate: logDate,
          date: logDate.slice(0, 10),
          time: time,
        }).save();
      }
      break;

    //   break;
    case "All":
      let cstUsers = [];
      let custToken = [];
      let allUserIds = [];
      let shoCusts = await customerModel.find();

      if (params.userList === "All") {
        // Fetch all customers
        shoCusts.forEach((item) => {
          if (item.notification_bell === true) {
            cstUsers.push(item._id.toString());
            if (item.fcmtoken) {
              custToken.push(item.fcmtoken); // Add valid FCM tokens
            }
          } else {
            console.log("No user with notification enabled");
          }
        });

        // Assign all customer IDs to allUserIds
        allUserIds = [...cstUsers];
      } else {
        // Fetch specific customers based on userList
        const filteredCusts = await customerModel.find(
          { _id: { $in: params.userList } },
          { _id: 1, notification_bell: 1, fcmtoken: 1 }
        );

        filteredCusts.forEach((item) => {
          if (item.notification_bell === true) {
            cstUsers.push(item._id.toString());
            if (item.fcmtoken) {
              custToken.push(item.fcmtoken); // Add valid FCM tokens
            }
          } else {
            console.log("No user with notification enabled");
          }
        });

        // Assign selected customer IDs to allUserIds
        allUserIds = [...cstUsers];
      }

      console.log("All user IDs:", allUserIds);

      // Send notifications only to valid customer tokens
      for (const token of custToken) {
        try {
          const accessToken = await userFcmFunction.getAccessToken();
          const message = {
            message: {
              token: token,
              notification: {
                title: params.subject,
                body: params.description,
              },
            },
          };

          await userFcmFunction.sendMessage(accessToken, message);
          console.log("Successfully sent notification");
        } catch (error) {
          console.log("Failed to send notification:", error.message);
        }
      }

      // Save notification to the database
      new notificationModel({
        sendTo: params.sendTo,
        users: allUserIds,
        isRead: allUserIds,
        title: params.subject,
        description: params.description,
        logCreatedDate: logDate,
        logModifiedDate: logDate,
        date: logDate.slice(0, 10),
        time: time,
      }).save();

      break;

    // //case :Investors
    // case "Investors":
    //   let InvestorscstUsers = [];
    //   let InvestorscustToken = [];
    //   let InvestorsallUserIds = [];
    //   let InvestorsshoCusts = await customerModel.find();

    //   if (params.userList === "All") {
    //     // Fetch all customers
    //     InvestorsshoCusts.forEach((item) => {
    //       if (item.notification_bell === true) {
    //         InvestorscstUsers.push(item._id.toString());
    //         if (item.fcmtoken) {
    //           InvestorscustToken.push(item.fcmtoken); // Add valid FCM tokens
    //         }
    //       } else {
    //         console.log("No user with notification enabled");
    //       }
    //     });

    //     // Assign all customer IDs to InvestorsallUserIds
    //     InvestorsallUserIds = [...InvestorscstUsers];
    //   } else {
    //     // Fetch specific customers based on userList
    //     const filteredCusts = await customerModel.find(
    //       { _id: { $in: params.userList } },
    //       { _id: 1, notification_bell: 1, fcmtoken: 1 }
    //     );

    //     filteredCusts.forEach((item) => {
    //       if (item.notification_bell === true) {
    //         InvestorscstUsers.push(item._id.toString());
    //         if (item.fcmtoken) {
    //           InvestorscustToken.push(item.fcmtoken); // Add valid FCM tokens
    //         }
    //       } else {
    //         console.log("No user with notification enabled");
    //       }
    //     });

    //     // Assign selected customer IDs to InvestorsallUserIds
    //     InvestorsallUserIds = [...InvestorscstUsers];
    //   }

    //   console.log("All user IDs:", InvestorsallUserIds);

    //   // Send notifications only to valid customer tokens
    //   for (const token of InvestorscustToken) {
    //     try {
    //       const accessToken = await userFcmFunction.getAccessToken();
    //       const message = {
    //         message: {
    //           token: token,
    //           notification: {
    //             title: params.subject,
    //             body: params.description,
    //           },
    //         },
    //       };

    //       await userFcmFunction.sendMessage(accessToken, message);
    //       console.log("Successfully sent notification");
    //     } catch (error) {
    //       console.log("Failed to send notification:", error.message);
    //     }
    //   }

    //   // Save notification to the database
    //   await new notificationModel({
    //     sendTo: params.sendTo,
    //     users: InvestorsallUserIds,
    //     isRead: InvestorsallUserIds,
    //     title: params.subject,
    //     description: params.description,
    //     logCreatedDate: logDate,
    //     logModifiedDate: logDate,
    //     date: logDate.slice(0, 10),
    //     time: time,
    //   }).save();

    //   break;

    case "Investors":
  let InvestorscstUsers = [];
  let InvestorscustToken = [];
  let InvestorsallUserIds = [];
  let InvestorsshoCusts = [];

  try {
    if (params.userList === "All") {
      // Fetch all customers
      InvestorsshoCusts = await customerModel.find();

      InvestorsshoCusts.forEach((item) => {
        if (item.notification_bell === true) {
          InvestorscstUsers.push(item._id.toString());
          if (item.fcmtoken) {
            InvestorscustToken.push(item.fcmtoken); // Add valid FCM tokens
          }
        }
      });
    } else {
      // Fetch specific customers based on userList
      InvestorsshoCusts = await customerModel.find(
        { _id: { $in: params.userList } },
        { _id: 1, notification_bell: 1, fcmtoken: 1 }
      );

      InvestorsshoCusts.forEach((item) => {
        if (item.notification_bell === true) {
          InvestorscstUsers.push(item._id.toString());
          if (item.fcmtoken) {
            InvestorscustToken.push(item.fcmtoken); // Add valid FCM tokens
          }
        }
      });
    }

    // Assign all customer IDs to InvestorsallUserIds
    InvestorsallUserIds = [...InvestorscstUsers];
    console.log("All user IDs:", InvestorsallUserIds);

    // Send notifications only to valid customer tokens
    for (const token of InvestorscustToken) {
      try {
        const accessToken = await userFcmFunction.getAccessToken();
        const message = {
          message: {
            token: token,
            notification: {
              title: params.subject,
              body: params.description,
            },
          },
        };

        const response = await userFcmFunction.sendMessage(accessToken, message);
        console.log("Successfully sent notification:", response);
      } catch (error) {
        if (error.error?.code === 404) {
          console.log(`Invalid or expired FCM token: ${token}`);
        } else {
          console.log("Failed to send notification:", error.message);
        }
      }
    }

    // Save notification to the database
    await notificationModel.create({
      sendTo: params.sendTo,
      users: InvestorsallUserIds,
      isRead: false, // Notifications are unread by default
      title: params.subject,
      description: params.description,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
      date: logDate.slice(0, 10),
      time: time,
    });

    console.log("Notification saved to database.");
  } catch (error) {
    console.error("Error processing Investors notifications:", error.message);
  }
  break;


    //case :Investors
    case "Startups":
      let StartupscstUsers = [];
      let StartupscustToken = [];
      let StartupsallUserIds = [];
      let StartupsshoCusts = await customerModel.find();

      if (params.userList === "All") {
        // Fetch all customers
        StartupsshoCusts.forEach((item) => {
          if (item.notification_bell === true) {
            StartupscstUsers.push(item._id.toString());
            if (item.fcmtoken) {
              StartupscustToken.push(item.fcmtoken); // Add valid FCM tokens
            }
          } else {
            console.log("No user with notification enabled");
          }
        });

        // Assign all customer IDs to StartupsallUserIds
        StartupsallUserIds = [...StartupscstUsers];
      } else {
        // Fetch specific customers based on userList
        const filteredCusts = await customerModel.find(
          { _id: { $in: params.userList } },
          { _id: 1, notification_bell: 1, fcmtoken: 1 }
        );

        filteredCusts.forEach((item) => {
          if (item.notification_bell === true) {
            StartupscstUsers.push(item._id.toString());
            if (item.fcmtoken) {
              StartupscustToken.push(item.fcmtoken); // Add valid FCM tokens
            }
          } else {
            console.log("No user with notification enabled");
          }
        });

        // Assign selected customer IDs to StartupsallUserIds
        StartupsallUserIds = [...StartupscstUsers];
      }

      console.log("All user IDs:", StartupsallUserIds);

      // Send notifications only to valid customer tokens
      for (const token of StartupscustToken) {
        try {
          const accessToken = await userFcmFunction.getAccessToken();
          const message = {
            message: {
              token: token,
              notification: {
                title: params.subject,
                body: params.description,
              },
            },
          };

          await userFcmFunction.sendMessage(accessToken, message);
          console.log("Successfully sent notification");
        } catch (error) {
          console.log("Failed to send notification:", error.message);
        }
      }

      // Save notification to the database
      new notificationModel({
        sendTo: params.sendTo,
        users: StartupsallUserIds,
        isRead: StartupsallUserIds,
        title: params.subject,
        description: params.description,
        logCreatedDate: logDate,
        logModifiedDate: logDate,
        date: logDate.slice(0, 10),
        time: time,
      }).save();

      break;
  }
};

let params = {
  sendTo: ["Admin", "User", "Startups", "Investors"],
  userList: ["All"],
  subject: "",
  description: "",
};

const mongoose = require("mongoose");
const ChatMessage = require("../../model/chatMessage");

exports.getAllChats = async (req, res) => {
  try {
    const receiverDetails = await ChatMessage.aggregate([
      // Match messages from the specified sender
      //{ $match: { senderId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $match: {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(req.userId),
              // recipientId: new mongoose.Types.ObjectId(contactId )
            },
            {
              //senderId: new mongoose.Types.ObjectId(contactId ),
              recipientId: new mongoose.Types.ObjectId(req.userId),
            },
          ],
        },
      },
      { $sort: { recipientId: 1, timestamp: -1 } },
      // Group by receiverId to get unique receiverIds
      //   { $group: { _id: "$recipientId" } },
      {
        $group: {
          _id: "$recipientId",
          latestMessage: { $first: "$message" },
          latestTimestamp: { $first: "$timestamp" },
          lastRecipientId: { $first: "$recipientId" }, // Get the senderId of the latest message
          seen: { $first: "$read" },
        },
      },

      // Lookup receiver details from the User collection
      {
        $lookup: {
          from: "users", // Replace "users" with your actual user collection name
          localField: "_id", // Field in Message collection (receiverId after grouping)
          foreignField: "_id", // Field in User collection
          as: "recipientDetails", // The resulting array field containing receiver info
        },
      },

      // Unwind to get each receiver detail as a separate document
      { $unwind: "$recipientDetails" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$recipientDetails", // Include all fields from recipientDetails
              {
                latestMessage: "$latestMessage", // The latest message text
                latestTimestamp: "$latestTimestamp", // The latest message timestamp
                seen: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $eq: [
                            "$lastRecipientId",
                            new mongoose.Types.ObjectId(req.userId),
                          ],
                        }, // Check if the last message senderId matches
                        { $eq: ["$seen", false] }, // Check if the latest message seen status is false
                      ],
                    },
                    then: false, // Set seen to false if both conditions are met
                    else: true, // Set seen to true otherwise
                  },
                },
                // seen: "$seen"
              },
            ],
            // Include all fields from recipientDetails directly
            // ..."$recipientDetails",
            // latestMessage: "$latestMessage",    // The latest message text
            // latestTimestamp: "$latestTimestamp" // The latest message timestamp
          },
        },
      },
      //  { $replaceRoot: { newRoot: "$recipientDetails" } },

      // Project to include only the desired fields
      //   {
      //     $project: {
      //       _id: 0,                    // Hide the internal _id
      //       recipientId: "$_id",        // Rename _id to receiverId
      //       recipientDetails: 1         // Include receiver details
      //     },
      //   },
    ]);

    //await newRideAlert.save();
    res.status(200).json({ message: "success", details: receiverDetails });
  } catch (error) {
    console.error("Error creating ride alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const chatHistory = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(userId),
              recipientId: new mongoose.Types.ObjectId(contactId),
            },
            {
              senderId: new mongoose.Types.ObjectId(contactId),
              recipientId: new mongoose.Types.ObjectId(userId),
            },
          ],
        },
      },
      {
        $sort: { timestamp: 1 },
      },
      {
        $addFields: {
          sent: {
            $cond: {
              if: { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              then: "right",
              else: "left",
            },
          },
        },
      },
    ]);

    console.log(chatHistory);

    res.status(200).json(chatHistory);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Could not fetch chat history" });
  }
};

exports.updateReadStatus = async (req, res) => {
  const { senderId } = req.body;

  try {
    const updateStatus = await ChatMessage.updateMany(
      {
        recipientId: req.userId,
        senderId: senderId,
      },
      {
        $set: {
          read: true,
        },
      }
    );
    res.status(200).json({ message: "success", details: updateStatus });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Could not fetch chat history" });
  }
};

exports.unseenCount = async (req, res) => {
  // const { userId, contactId } = req.params;

  try {
    const receiverDetails = await ChatMessage.aggregate([
      // Match messages from the specified sender
      //{ $match: { senderId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $match: {
          //senderId: new mongoose.Types.ObjectId(contactId ),
          recipientId: new mongoose.Types.ObjectId(req.userId),
          read: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          //   latestMessage: { $first: "$message" },
          //   latestTimestamp: { $first: "$timestamp" },
          //   lastRecipientId: { $first: "$recipientId" }, // Get the senderId of the latest message
          //   seen: { $first: "$read" },
        },
      },
    ]);

    res.status(200).json({
      message: "success",
      details: receiverDetails,
      unseenLength: receiverDetails.length,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Could not fetch chat history" });
  }
};

// Example usage

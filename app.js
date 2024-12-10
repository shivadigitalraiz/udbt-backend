const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const cron = require("node-cron");
const http = require("http");
// const moment = require("moment");
const upload = multer();

const mongoose = require("mongoose");
require("dotenv").config();
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// defining folder for uploading the files/images/documents
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/views", express.static(path.join(__dirname, "views")));

// main admin api
const mainRoute = require("./routers/mainRoutes");
app.use("/v1/udbtApi", mainRoute);

//test api
app.get("/", (req, res) => {
  res
    .status(200)
    .send(`<center><h1>💲💻 Welcome to the UDBT 📱💲</h1></center>`);
});
// console.log(process.env.MONGODB_CONNECTION_LIVE);

//connecting to database
mongoose.set("strictQuery", true);
mongoose
  .connect(
    // process.env.MONGODB_CONNECTION_LIVE,
    process.env.MONGODB_CONNECTION_ATLAS
  )
  .then(() => {
    console.log("The database was successfully connected.");
  })
  .catch(() => {
    console.log("Sorry, the database was not found!");
  });

// to keep ruunung the server
cron.schedule("0 */3 * * * *", () => {
  console.log("Server running on port 6300");
});

//----------------------------------------- CHAT ------------------------------------------//
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

const clients = {};

const userSockets = {};
const ChatMessage = require("./model/chatMessage");

// Inside your Socket.IO connection setup
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("register", (userId) => {
    userSockets[userId] = socket;
    socket.userId = userId;
    console.log(`User ${userId} registered`);
  });

  // Handle private message event
  socket.on("private_message", async (data) => {
    console.log(data);
    const { senderId, recipientId, message } = data;
    const recipientSocket = userSockets[recipientId];

    // Save message to the database
    const chatMessage = new ChatMessage({
      senderId,
      recipientId,
      message,
      roomId: `${senderId}-${recipientId}`, // Example room ID format
    });

    try {
      await chatMessage.save();
      console.log("Message saved to database");

      // Send message to the recipient if they're online
      if (recipientSocket) {
        recipientSocket.emit("private_message", {
          senderId,
          message,
          timestamp: chatMessage.timestamp,
        });
        console.log(`Message from ${senderId} to ${recipientId}: ${message}`);
      } else {
        console.log(`User ${recipientId} is not online`);
        // await notificationUtil.createNotification({
        //   // sendTo: "Vendor",
        //   // userList: req.body.users[0].value,
        //   // subject: "Notification",
        //   // description: "Notification has been sent",
        //   sendTo: "User",
        //   userList: recipientId,
        //   subject: "New Message",
        //   description: "New message from your chat",
        // });
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      delete userSockets[socket.userId];
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

//----------------------------------------- CHAT  END ------------------------------------------//

// app.listen(process.env.PORT, () => {
//   console.log(`The server is running on port ${process.env.PORT}`);
// });

// app.js main listner
server.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});

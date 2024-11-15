// importing models
const userModel = require("../../model/user");
const Otp = require("../../model/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { DateTime } = require("luxon");
const axios = require("axios");
const mongoose = require("mongoose");

//
const userPostsModel = require("../../model/userPosts");
const savePostsModel = require("../../model/savePosts");
const commentPostsModel = require("../../model/userComentPosts");
const followersModel = require("../../model/userfollower");

const likedPostsModel = require("../../model/userLikeposts");

//static otp --- 1234
async function generateOtp(user) {
  const istDateTime = DateTime.now().setZone("Asia/Kolkata");
  const logDate = istDateTime.toISO({ includeOffset: true });

  // Set OTP statically to 123456
  const otp = "1234";

  // Create a new OTP document
  const newOtpObject = new Otp({
    otp: otp,
    userId: user._id,
    phone: user.phone,
    emailId: user.email,
    expireAt: new Date(Date.now() + 10 * 60 * 1000), // Set expiration time to 10 minutes from now
    logCreatedDate: logDate,
    logModifiedDate: logDate,
  });

  // Save the OTP document to the database
  const savedOtpObject = await newOtpObject.save();
  console.log("Generated OTP------------------------------------------:", otp);

  return savedOtpObject; // Return the saved OTP document
}

const sendMail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
  }
};

//------------------------- TO CALL THE DYNAMIC OTP IN 4 DIGITS -----------------------//
// async function generateOtp(user) {
//   const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//   const logDate = istDateTime.toISO({ includeOffset: true });

//   // Generate a dynamic OTP (4 digits)
//   const otp = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number

//   // Create a new OTP document
//   const newOtpObject = new Otp({
//     otp: otp.toString(), // Ensure the OTP is stored as a string
//     userId: user._id,
//     phone: user.phone,
//     emailId: user.email,
//     expireAt: new Date(Date.now() + 10 * 60 * 1000), // Set expiration time to 10 minutes from now
//     logCreatedDate: logDate,
//     logModifiedDate: logDate,
//   });

//   // Save the OTP document to the database
//   const savedOtpObject = await newOtpObject.save();
//   console.log("Generated OTP------------------------------------------:", otp);

//   return savedOtpObject; // Return the saved OTP document
// }

exports.userRegistration = async function (req, res) {
  try {
    console.log(req.body, "Complete Request Body");

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const existingUser = await userModel.findOne({ phone: req.body.phone });

    // // User unique ID generation logic
    // const latestUser = await userModel.findOne().sort({ userUniqueId: -1 });
    // const bookingNum =
    //   latestUser && latestUser.userUniqueId
    //     ? parseInt(latestUser.userUniqueId.substring(3)) + 1
    //     : 1;
    // const cId = String(bookingNum).padStart(5, "0");
    // const userUniqueId = "USR" + cId;

    if (existingUser) {
      console.log("Updating existing user information");

      const updatedUser = await userModel.findOneAndUpdate(
        { phone: req.body.phone },
        {
          fullNameorCompanyName: req.body.fullNameorCompanyName,
          email: req.body.email,
          phone: req.body.phone,
          password: hashedPassword,
          designationorCompanytype: req.body.designationorCompanytype,
          link: req.body.link,
          city: req.body.city,
          investements: req.body.investements,
          funds: req.body.funds,
          about: req.body.about,
          bio: req.body.bio,
          isStartupOrInvestor: req.body.isStartupOrInvestor,
          founded: req.body.founded,
          valuation: req.body.valuation,
          fcmtoken: req.body.fcmtoken,
          interests: req.body.interests,
          logModifiedDate: logDate,
          status: "active",
          // userUniqueId: userUniqueId,
        },
        { new: true }
      );

      let token = jwt.sign(
        {
          userId: updatedUser._id,
          phone: updatedUser.phone,
        },
        process.env.ADMIN_SECRET_KEY,
        { expiresIn: process.env.ADMIN_EXPIRY_DATE }
      );

      // No OTP email sent for updates
      return res.status(200).json({
        success: true,
        token,
        message: "User information updated successfully",
      });
    }

    // User unique ID generation logic
    const latestUser = await userModel.findOne().sort({ userUniqueId: -1 });
    const bookingNum =
      latestUser && latestUser.userUniqueId
        ? parseInt(latestUser.userUniqueId.substring(3)) + 1
        : 1;
    const cId = String(bookingNum).padStart(5, "0");
    const userUniqueId = "USR" + cId;

    // New user registration
    const userObj = new userModel({
      userUniqueId: userUniqueId,
      fullNameorCompanyName: req.body.fullNameorCompanyName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      designationorCompanytype: req.body.designationorCompanytype,
      link: req.body.link,
      city: req.body.city,
      investements: req.body.investements,
      funds: req.body.funds,
      about: req.body.about,
      bio: req.body.bio,
      isStartupOrInvestor: req.body.isStartupOrInvestor,
      founded: req.body.founded,
      valuation: req.body.valuation,
      fcmtoken: req.body.fcmtoken,
      interests: req.body.interests,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
      status: "active",
    });

    const saveUser = await userObj.save();
    if (saveUser) {
      let token = jwt.sign(
        {
          userId: userObj._id,
          phone: userObj.phone,
        },
        process.env.ADMIN_SECRET_KEY,
        { expiresIn: process.env.ADMIN_EXPIRY_DATE }
      );

      const savedOtpObject = await generateOtp(userObj);

      // Send email with OTP only for new user registration
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userObj.email,
        subject: "Welcome to Our Platform",
        text: `Hello ${userObj.fullNameorCompanyName},\n\nThank you for registering with us!\nYour OTP is ${savedOtpObject.otp}.\n\nBest regards,\nUDBT`,
      };
      await sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        token,
        message: "User registered successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "User could not register",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.verification = async function (req, res) {
  try {
    console.log("req.body:----------------------", req.body);
    const { email, otp } = req.body; // Only use email and otp from the request body

    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // Find the user by email

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    // Find the OTP document associated with the user and verify it
    const otpData = await Otp.findOne({
      userId: user._id,
      otp: otp,
      emailId: user.email,
      expireAt: { $gt: new Date() }, // OTP must not be expired
    });

    if (otpData) {
      // Generate JWT token if OTP is valid
      let token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.ADMIN_SECRET_KEY,
        { expiresIn: process.env.ADMIN_EXPIRY_DATE }
      );

      // Update user login status and logModifiedDate
      const updateResult = await userModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            isloggedin: true,
            logModifiedDate: logDate,
          },
        },
        { new: true }
      );
      console.log(
        "Update Result------------------------------+++: ",
        updateResult
      );

      return res.status(200).json({
        success: true,
        message: "OTP Verified Successfully",
        data: updateResult,
        token: token,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or Expired OTP" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Something went wrong. Please try again",
    });
  }
};

exports.userLogin = async function (req, res) {
  try {
    const { password, email, fcmtoken } = req.body; // Extract email, password, and fcmtoken from request body

    console.log("req.body:----------------------", req.body);
    console.log(fcmtoken, "req.body.fcmtoken");

    // Find the user by email
    const user = await userModel.findOne({ email: email });

    // if (!user) {
    //   return res.status(400).json({ message: "User not found" });
    // } else if (!user.status) {
    //   return res.status(400).json({
    //     message:
    //       "Your account has been blocked by the admin, please contact support.",
    //   });
    // } else {
    //   // Verify user's password using bcrypt
    //   if (!user.password) {
    //     return res.status(400).json({
    //       message: "Please register",
    //     });
    //   }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else if (user.isdeleted === "Yes") {
      return res.status(400).json({
        message: "Your account has been deleted",
      });
    } else if (!user.status) {
      return res.status(400).json({
        message:
          "Your account has been blocked by the admin, please contact support.",
      });
    } else {
      // Verify user's password using bcrypt
      if (!user.password) {
        return res.status(400).json({
          message: "Please register",
        });
      }

      console.log(password, "ooo", user.password);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      } else {
        // Generate JWT token with user details
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            status: user.status,
          },
          process.env.ADMIN_SECRET_KEY,
          { expiresIn: process.env.ADMIN_EXPIRY_DATE }
        );

        // Update user with fcmToken and set isloggedin to true
        const userUpdate = await userModel.findOneAndUpdate(
          { _id: user._id },
          {
            fcmtoken: fcmtoken, // Update the fcm token
            isloggedin: true, // Set isloggedin to true
          },
          { new: true } // This option returns the updated document
        );
        console.log(
          "userUpdated data at login-----------------------------:",
          userUpdate
        );
        console.log("Generated Token login----------------------:", token); // Log the token to the console

        return res.status(200).json({
          message: "You have successfully logged in",
          token: token,
          userId: user._id,
          user: userUpdate, // Return the updated user information
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// exports.getuserProfile = async function (req, res) {
//   try {
//     console.log(req.userId);
//     const userProfile = await userModel.findOne(
//       {
//         _id: req.userId,
//       },
//       {
//         logCreatedDate: 0,
//         logModifiedDate: 0,
//       }
//     );
//     if (userProfile) {
//       res.status(200).json({
//         message: "Your data was successfully retrived",
//         userProfile,
//       });
//     } else {
//       res.status(400).json({ message: "Your data could not be retrived" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: "Something went wrong" });
//   }
// };

exports.getuserProfile = async function (req, res) {
  try {
    console.log(
      "Received request with req.userId----------------:",
      req.userId
    );
    const userId = new mongoose.Types.ObjectId(req.userId);

    const userResult = await userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    const user = userResult.length > 0 ? userResult[0] : {};

    console.log("Fetched user details---------------------------------:", user);

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
exports.changepassword = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const password = req.body.password;
    const newpassword = req.body.newpassword;
    const confirmpassword = req.body.confirmpassword;

    if (password == null || password == "" || password == undefined) {
      res
        .status(400)
        .json({ success: false, message: "Please enter current password" });
    }
    const userPass = await userModel.findOne(
      { _id: req.userId },
      { password: 1 }
    );
    console.log(userPass);
    let currentPassVal = bcrypt.compareSync(password, userPass.password);
    if (currentPassVal == true) {
      if (newpassword === confirmpassword) {
        const bcryptedpassword = bcrypt.hashSync(confirmpassword, 10);
        await userModel.updateOne(
          { _id: req.userId },
          {
            $set: {
              password: bcryptedpassword,
              logModifiedDate: logDate,
            },
          },
          {
            new: true,
          }
        );
        return res
          .status(200)
          .json({ success: true, message: "Password updated successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "New password does not match" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid Old Password" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

exports.edituserProfile = async function (req, res) {
  try {
    // Get the current IST time for logModifiedDate
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // Prepare the fields to be updated in the user profile
    const updatedFields = {
      fullNameorCompanyName: req.body.fullNameorCompanyName,
      designationorCompanytype: req.body.designationorCompanytype,
      link: req.body.link,
      city: req.body.city,
      //
      investements: req.body.investements,
      funds: req.body.funds,
      //
      founded: req.body.founded,
      valuation: req.body.valuation,

      about: req.body.about,
      bio: req.body.bio,
      // profilePic: req.file ? req.file.path : console.log("No Img"),
      // investements: JSON.parse(req.body.investements),
      // funds: JSON.parse(req.body.funds),

      logModifiedDate: logDate,
    };

    // Update the user profile
    const profileResult = await userModel.findOneAndUpdate(
      { _id: req.userId },
      { $set: updatedFields },
      { new: true } // Ensure the updated document is returned
    );

    // Check if the profile update was successful
    if (profileResult) {
      // Return the success response
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: profileResult,
      });
    } else {
      // If profile could not be updated, return a failure message
      res.status(400).json({
        success: false,
        message: "Profile could not be updated",
      });
    }
  } catch (err) {
    console.log(err); // Log the error for debugging
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.userlogout = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const userId = req.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await userModel.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          isloggedin: false,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (user) {
      res.status(200).json({
        success: true,
        message: "User has been logged out successfully",
        isloggedin: user.isloggedin,
      });
    } else {
      res.status(400).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// forgotPassword function

exports.forgotPassword = async function (req, res) {
  try {
    console.log("req.body:------------------", req.body);

    // Find the user by email and ensure the account is active
    const user = await userModel.findOne({
      email: req.body.email,
      status: "active",
    });

    // if (!user) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "User is not registered with this email",
    //   });
    // }
    if (user.status !== "active") {
      const message =
        user.status === "inactive"
          ? "Your account is inactive. Please contact support."
          : "Your account has been blocked by the admin.";
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Check if an OTP already exists for the given email
    const existingOtp = await Otp.findOne({
      emailId: req.body.email,
      expireAt: { $gt: new Date() }, // Ensure OTP is valid and not expired
    });

    // If an existing valid OTP exists, return a response without generating a new OTP
    if (existingOtp) {
      return res.status(200).json({
        success: true,
        message: "An OTP is already sent to this email.",
        userInfo: user._id,
      });
    }

    // Generate OTP (you can implement the logic in generateOtp function or directly here)
    //const otpCode = Math.floor(1000 + Math.random() * 9000); // Simple OTP generation (you can replace this with your own method)
    const otpCode = "1234";
    // Save OTP and email in otpModel
    const otpRecord = new Otp({
      otp: otpCode,
      emailId: req.body.email, // Save the email here
      phone: user.phone, // Assuming user has a phone field
      userId: user._id, // Linking the OTP to the user
      expireAt: new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
    });

    await otpRecord.save(); // Save the OTP record in the database

    // Setup email transporter for sending OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sandeep.digitalraiz@gmail.com",
        pass: process.env.EMAIL_PASSWORD, // Use environment variable for security
      },
    });

    // Email options including only the OTP in the email body
    const mailOptions = {
      from: "sandeep.digitalraiz@gmail.com",
      to: req.body.email,
      subject: "Forgot Password OTP",
      text: `Hello ${
        user.fullNameorCompanyName || "User"
      },\n\nYour OTP for password reset is: ${otpCode}\n\nThank you.`,
    };

    // Send OTP email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error sending OTP email",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          success: true,
          message: "OTP has been sent successfully to the specified email",
          userInfo: user._id,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.setpassword = async (req, res) => {
  try {
    console.log(req.body);
    // const otp = await Otp.findOne(
    //   // { phone: req.body.phone },
    //   { emailId: req.body.email },
    //   { otp: 1, emailId: 1, phone: 1 }
    // ).sort({ createdAt: -1 });
    // if (!otp) {
    //   return res
    //     .status(400)
    //     .json({ message: "OTP not found for phone number" });
    // }
    // if (otp.otp !== req.body.otp) {
    //   return res.status(400).json({ message: "Invalid OTP" });
    // }
    const newPassword = req.body.newpassword;
    const confirmPassword = req.body.confirmpassword;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    // TODO: Add password complexity and length validation here
    const hashedPassword = bcrypt.hashSync(confirmPassword, 10);

    const updatedUser = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ message: "User  not found" });
    }
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

exports.deleteAccount = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const delUser = await userModel.findByIdAndUpdate(
      { _id: req.userId },
      {
        $set: {
          isdeleted: "Yes",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (delUser) {
      res.status(200).json({
        success: true,
        message: "Account Deleted successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "Something went wrong" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//update api for intrests
exports.updateinstrestsforuser = async function (req, res) {
  try {
    const updateintrests = await userModel.updateOne(
      { _id: req.userId },
      {
        $set: {
          interests: req.body.interests,
        },
      },
      {
        new: true,
      }
    );
    if (updateintrests) {
      res.status(200).json({ success: true, message: "Updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Please try again" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//the below api is to resend the otp
exports.sendOtpforemail = async function (req, res) {
  try {
    const { email } = req.body;

    // Set the current date in the IST timezone
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    let userData = await userModel.findOne({ email: email });

    if (userData) {
      // Check if the account is deleted
      if (userData.isdeleted !== "No") {
        return res.status(400).json({
          success: false,
          message: "This account has been deleted.",
        });
      }

      // Check if the user's account is active or inactive
      if (userData.status !== "active" && userData.status !== "inactive") {
        return res.status(400).json({
          success: false,
          message: "Your account is blocked. Please contact the support team.",
        });
      }
    } else {
      // Create a new user if no user is found with the given email
      userData = new userModel({
        email: email,
        name: "",
        status: "active",
        isdeleted: "No",
        logCreatedDate: logDate,
      });
      await userData.save();
    }

    // Generate OTP and save to database
    const otpDetails = await generateOtp(userData);
    const otp = otpDetails.otp; // Extract only the OTP value

    // Email functionality
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sandeep.digitalraiz@gmail.com",
        pass: process.env.EMAIL_PASSWORD, // Use environment variable for security
      },
    });

    const mailOptions = {
      from: "sandeep.digitalraiz@gmail.com",
      to: email,
      subject: "OTP for Password Reset",
      text: `Hello ${
        userData.fullNameorCompanyName || "User"
      },\n\nYour OTP for password reset is: ${otp}\n\nThank you.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error sending OTP email",
        });
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: { email: userData.email },
      otp: otp,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//update profile pic
exports.updateprofilepicforuser = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const upProfileImg = await userModel.updateOne(
      {
        _id: req.userId,
      },
      {
        $set: {
          profilePic: req.file ? req.file.path : console.log("No Img"),
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (upProfileImg) {
      res
        .status(200)
        .json({ success: true, message: "Profile Image has been updated" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

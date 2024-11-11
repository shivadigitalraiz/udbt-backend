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

//static otp
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
    // emailId: email,
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

// exports.userRegistration = async function (req, res) {
//   try {
//     console.log(req.body, "Complete Request Body");

//     if (req.body.password !== req.body.confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Password and confirmPassword do not match",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });

//     const existingUser = await userModel.findOne({ phone: req.body.phone });

//     // User unique ID generation logic
//     const latestUser = await userModel.findOne().sort({ userUniqueId: -1 });
//     const bookingNum =
//       latestUser && latestUser.userUniqueId
//         ? parseInt(latestUser.userUniqueId.substring(3)) + 1
//         : 1;
//     const cId = String(bookingNum).padStart(5, "0");
//     const userUniqueId = "USR" + cId;

//     if (existingUser) {
//       console.log("Updating existing user information");

//       const updatedUser = await userModel.findOneAndUpdate(
//         { phone: req.body.phone },
//         {
//           fullNameorCompanyName: req.body.fullNameorCompanyName,
//           email: req.body.email,
//           phone: req.body.phone,
//           password: hashedPassword,
//           designationorCompanytype: req.body.designationorCompanytype,
//           link: req.body.link,
//           city: req.body.city,
//           investements: req.body.investements,
//           funds: req.body.funds,
//           about: req.body.about,
//           bio: req.body.bio,
//           isStartupOrInvestor: req.body.isStartupOrInvestor,
//           founded: req.body.founded,
//           valuation: req.body.valuation,
//           fcmtoken: req.body.fcmtoken,
//           logModifiedDate: logDate,
//           status: "active",
//           userUniqueId: userUniqueId,
//         },
//         { new: true }
//       );

//       let token = jwt.sign(
//         {
//           userId: updatedUser._id,
//           phone: updatedUser.phone,
//         },
//         process.env.ADMIN_SECRET_KEY,
//         { expiresIn: process.env.ADMIN_EXPIRY_DATE }
//       );

//       await generateOtp(updatedUser);

//       return res.status(200).json({
//         success: true,
//         token,
//         message: "User information updated successfully",
//       });
//     }

//     // New user registration
//     const userObj = new userModel({
//       fullNameorCompanyName: req.body.fullNameorCompanyName,
//       email: req.body.email,
//       phone: req.body.phone,
//       password: hashedPassword,
//       designationorCompanytype: req.body.designationorCompanytype,
//       link: req.body.link,
//       city: req.body.city,
//       investements: req.body.investements,
//       funds: req.body.funds,
//       about: req.body.about,
//       bio: req.body.bio,
//       isStartupOrInvestor: req.body.isStartupOrInvestor,
//       founded: req.body.founded,
//       valuation: req.body.valuation,
//       fcmtoken: req.body.fcmtoken,
//       logCreatedDate: logDate,
//       logModifiedDate: logDate,
//       status: "active",
//     });

//     const saveUser = await userObj.save();
//     if (saveUser) {
//       let token = jwt.sign(
//         {
//           userId: userObj._id,
//           phone: userObj.phone,
//         },
//         process.env.ADMIN_SECRET_KEY,
//         { expiresIn: process.env.ADMIN_EXPIRY_DATE }
//       );

//       // await generateOtp(userObj);
//       // const otp = savedOtpObject.otp;

//       // Generate OTP and get the saved OTP object
//       const savedOtpObject = await generateOtp(userObj);
//       const otp = savedOtpObject.otp;

//       // Send email only for new user registration
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: userObj.email,
//         subject: "Welcome to Our Platform",
//         text: `Hello ${userObj.fullNameorCompanyName},\n\nThank you for registering with us!\n\nBest regards,\nYour Company`,
//       };
//       await sendMail(mailOptions);

//       return res.status(200).json({
//         success: true,
//         token,
//         message: "User registered successfully",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "User could not register",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

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

exports.getuserProfile = async function (req, res) {
  try {
    console.log(req.userId);
    const userProfile = await userModel.findOne(
      {
        _id: req.userId,
      },
      {
        logCreatedDate: 0,
        logModifiedDate: 0,
      }
    );
    if (userProfile) {
      res.status(200).json({
        message: "Your data was successfully retrived",
        userProfile,
      });
    } else {
      res.status(400).json({ message: "Your data could not be retrived" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
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
      investements: JSON.parse(req.body.investements),
      funds: JSON.parse(req.body.funds),
      about: req.body.about,
      profilePic: req.file ? req.file.path : console.log("No Img"),
      bio: req.body.bio,
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
    console.error(err); // Log the error for debugging
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

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered with this email",
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
    const otp = await Otp.findOne(
      // { phone: req.body.phone },
      { emailId: req.body.email },
      { otp: 1, emailId: 1, phone: 1 }
    ).sort({ createdAt: -1 });
    if (!otp) {
      return res
        .status(400)
        .json({ message: "OTP not found for phone number" });
    }
    if (otp.otp !== req.body.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
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

// importing models
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// To read a ejs file || template engine
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const axios = require("axios");

// importing models
const Admin = require("../../model/admin");
const otpModel = require("../../model/otp");
//const staffModel = require("../../model/staff");
//const roleModel = require("../../model/roleAndPermission");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { DateTime } = require("luxon");

// admin registration
exports.adminRegistration = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // console.log(req.body)
    const user = await Admin.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (user) {
      res.status(400).json({
        success: false,
        message: "This user is already registered",
      });
    }
    const bcryptedpassword = bcrypt.hashSync(req.body.password, 10);

    const adminEmpObj = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: bcryptedpassword,
      phone: req.body.phone,
      address: req.body.address,
      status: "active",
      rolesAndPermission: [
        {
          Dashview: true,
        },
      ],
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });
    const userData = await adminEmpObj.save();
    if (userData) {
      return res.status(200).json({
        success: true,
        message: "The user is registered successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "The user is not registered",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// admin login
// exports.adminlogin = async function (req, res) {
//   const user = await Admin.findOne({
//     $or: [{ email: req.body.email }, { phone: req.body.phone }],
//   });
//   if (user !== null) {
//     const password = req.body.password;
//     const pass = bcrypt.compareSync(password, user.password);
//     if (pass == true && user.status === "active") {
//       let token = jwt.sign(
//         {
//           userId: user._id,
//           password: user.password,
//           phone: user.phone,
//           email: user.email,
//         },
//         process.env.ADMIN_SECRET_KEY,
//         { expiresIn: process.env.ADMIN_EXPIRY_DATE }
//       );
//       const userData = {
//         _id: user._id,
//         email: user.email,
//         name: user.name,
//         phone: user.phone,
//       };
//       let rolesAndPermission =
//         user.rolesAndPermission.length !== 0 ? user.rolesAndPermission[0] : {};
//       return res.status(200).json({
//         success: true,
//         message: "You have successfully loged in",
//         token: token,
//         user: userData,
//         rolesAndPermission: rolesAndPermission,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "User inactive or incorrect password",
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide a correct email address or phone number",
//     });
//   }
// };
exports.adminlogin = async function (req, res) {
  const user = await Admin.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  });
  if (user !== null) {
    const password = req.body.password;
    const pass = bcrypt.compareSync(password, user.password);
    if (pass == true && user.status === "active") {
      let token = jwt.sign(
        {
          userId: user._id,
          password: user.password,
          phone: user.phone,
          email: user.email,
        },
        process.env.ADMIN_SECRET_KEY,
        { expiresIn: process.env.ADMIN_EXPIRY_DATE }
      );
      const userData = {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      };
      let rolesAndPermission =
        user.rolesAndPermission.length !== 0 ? user.rolesAndPermission[0] : {};
      return res.status(200).json({
        success: true,
        message: "You have successfully loged in",
        token: token,
        user: userData,
        rolesAndPermission: rolesAndPermission,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "User inactive or incorrect password",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Please provide a correct email address or phone number",
    });
  }
};

// admi login and staff login
// exports.adminlogin = async function (req, res) {
//   const user = await Admin.findOne({
//     $or: [{ email: req.body.email }, { phone: req.body.email }],
//   });
//   if (user !== null) {
//     const password = req.body.password;
//     const pass = bcrypt.compareSync(password, user.password);
//     if (pass == true && user.status === "active") {
//       let token = jwt.sign(
//         {
//           userId: user._id,
//           password: user.password,
//           phone: user.phone,
//           email: user.email,
//         },
//         process.env.ADMIN_SECRET_KEY,
//         { expiresIn: process.env.ADMIN_EXPIRY_DATE }
//       );
//       const userData = {
//         _id: user._id,
//         department: "Admin",
//         email: user.email,
//         name: user.name,
//         phone: user.phone,
//       };

//       let rolesAndPermission =
//         user.rolesAndPermission.length !== 0 ? user.rolesAndPermission[0] : {};
//       return res.status(200).json({
//         success: true,
//         message: "You have successfully loged in",
//         token: token,
//         user: userData,
//         rolesAndPermission: [{ accessAll: true }],
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "User inactive or incorrect password",
//       });
//     }
//   } else {
//     const staff = await staffModel.findOne({
//       $or: [{ email: req.body.email }, { phone: req.body.email }],
//     });
//     if (staff !== null) {
//       const password = req.body.password;
//       const pass = bcrypt.compareSync(password, staff.password);
//       if (pass == true) {
//         let token = jwt.sign(
//           {
//             userId: staff._id,
//             password: staff.password,
//             phone: staff.phone,
//             email: staff.email,
//           },
//           process.env.ADMIN_SECRET_KEY,
//           { expiresIn: process.env.ADMIN_EXPIRY_DATE }
//         );
//         const staffData = {
//           _id: staff._id,
//           department: "Staff",
//           email: staff.email,
//           name: staff.name,
//           phone: staff.phone,
//         };

//         const rolesdata = await roleModel.findOne({
//           _id: new ObjectId(staff.roleId),
//         });
//         if (!rolesdata) {
//           return res.status(400).json({
//             success: true,
//             message: "Invalid role. Please modify staff role",
//           });
//         }

//         let rolesAndPermission =
//           rolesdata.rolesAndPermission.length !== 0
//             ? rolesdata.rolesAndPermission
//             : {};

//         // console.log("rolesAndPermission", rolesAndPermission);
//         return res.status(200).json({
//           success: true,
//           message: "You have successfully loged in",
//           token: token,
//           user: staffData,
//           rolesAndPermission: rolesAndPermission,
//         });
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "User inactive or incorrect password",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a correct email address or phone number",
//       });
//     }
//   }
// };

// get adminprofile
exports.getadminProfile = async function (req, res) {
  try {
    const profileResult = await Admin.findOne(
      {
        _id: req.userId,
      },
      {
        name: 1,
        email: 1,
        phone: 1,
        status: 1,
        address: 1,
        role: 1,
        profilePic: 1,
        rolesAndPermission: 1,
      }
    );
    if (profileResult) {
      res.status(200).json({
        success: true,
        message: "Your data was successfully retrived",
        profileResult,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//  To get admin profile and staff profile
// exports.getadminProfile = async function (req, res) {
//   try {
//     console.log("USERR ID --->", req.userId);
//     let profile = null;

//     // Check if the user is an admin and retrieve the profile data
//     const adminProfile = await Admin.findOne({ _id: req.userId });

//     if (adminProfile) {
//       profile = {
//         _id: adminProfile._id,
//         name: adminProfile.name,
//         email: adminProfile.email,
//         phone: adminProfile.phone,
//         address: adminProfile.address,
//         status: adminProfile.status,
//         profilePic: adminProfile.profilePic, // Assuming profilePic is a field in the Admin model
//         rolesAndPermission: adminProfile.rolesAndPermission || [], // Provide default empty array if rolesAndPermission is null
//       };
//     } else {
//       // Check if the user is a staff and retrieve the profile data
//       const staffProfile = await staffModel.findOne({ _id: req.userId });

//       if (staffProfile) {
//         profile = {
//           _id: staffProfile._id,
//           name: staffProfile.name,
//           email: staffProfile.email,
//           phone: staffProfile.phone,
//           address: staffProfile.address,
//           status: staffProfile.status,
//           profilePic: staffProfile.profilepic || "",
//         };
//       } else {
//         return res.status(404).json({
//           success: false,
//           message: "Profile data not found",
//         });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Your data was successfully retrieved",
//       profileResult: profile,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

// upate admin profilepic
exports.updateadminProfileImg = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const upProfileImg = await Admin.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        $set: {
          profilePic: req.file ? req.file.path : "",
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

// To update the admin profilepic and staff profilepic
// exports.updateadminProfileImg = async function (req, res) {
//   try {
//     console.log("Request File:", req.file); // Check if req.file is populated
//     console.log("User ID:", req.userId); // Check the value of req.userId

//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });

//     let updatedProfilePic;

//     const staff = await staffModel.findOne({ _id: req.userId });
//     const admin = await Admin.findOne({ _id: req.userId });

//     if (staff) {
//       updatedProfilePic = await staffModel.findOneAndUpdate(
//         { _id: req.userId },
//         {
//           $set: {
//             profilepic: req.file ? req.file.path : console.log("No Img"),
//             logModifiedDate: logDate,
//           },
//         },
//         { new: true }
//       );
//     } else if (admin) {
//       updatedProfilePic = await Admin.findOneAndUpdate(
//         { _id: req.userId },
//         {
//           $set: {
//             profilePic: req.file ? req.file.path : console.log("No Img"),
//             logModifiedDate: logDate,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     console.log("Updated Profile Pic:", updatedProfilePic); // Log the updated document

//     if (updatedProfilePic) {
//       return res.status(200).json({
//         success: true,
//         message: "Profile picture has been updated",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to update profile picture",
//       });
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };
// update admin profile
// exports.updateprofile = async function (req, res) {
//   try {
//     const { DateTime } = require("luxon");
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });

//     const UpProfile = await Admin.findOneAndUpdate(
//       { _id: req.userId },
//       {
//         $set: {
//           name: req.body.name,
//           email: req.body.email,
//           phone: req.body.phone,
//           address: req.body.address,
//           logModifiedDate: logDate,
//         },
//       },
//       {
//         new: true,
//       }
//     );
//     if (UpProfile) {
//       res
//         .status(200)
//         .json({ success: true, message: "Your profile has been updated" });
//     } else {
//       res.status(400).json({ success: false, message: "Bad request" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ success: false, message: "Something went wrong" });
//   }
// };

// To update the admin profile and staff profile

exports.updateprofile = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const updatedAdmin = await Admin.updateOne(
      { _id: req.userId },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
          status: req.body.status,
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (updatedAdmin) {
      res.status(200).json({ success: true, message: "Updatedsuccessfully" });
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

// change admin password
exports.changeAdminpassword = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
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
    const userPass = await Admin.findOne({ _id: req.userId }, { password: 1 });
    let currentPassVal = bcrypt.compareSync(password, userPass.password);
    if (currentPassVal == true) {
      if (newpassword === confirmpassword) {
        const bcryptedpassword = bcrypt.hashSync(confirmpassword, 10);
        await Admin.updateOne(
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

//chnage the password of the admin and the staff both
// exports.changeAdminpassword = async function (req, res) {
//   try {
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });

//     const { password, newpassword, confirmpassword } = req.body;

//     if (!password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Please enter current password" });
//     }

//     const userId = req.userId;
//     let userPass, userCollection, updateResult;

//     // Check if the user is an Admin
//     userPass = await Admin.findOne({ _id: userId }, { password: 1 });
//     if (userPass) {
//       userCollection = Admin;
//     } else {
//       // If not an Admin, check if the user is a Staff
//       userPass = await staffModel.findOne({ _id: userId }, { password: 1 });
//       if (userPass) {
//         userCollection = staffModel;
//       } else {
//         return res
//           .status(404)
//           .json({ success: false, message: "User not found" });
//       }
//     }

//     const currentPassVal = bcrypt.compareSync(password, userPass.password);
//     if (currentPassVal) {
//       if (newpassword === confirmpassword) {
//         const bcryptedpassword = bcrypt.hashSync(confirmpassword, 10);

//         // Update password in the identified collection
//         if (userCollection === Admin) {
//           // Use updateOne for Admin
//           updateResult = await Admin.updateOne(
//             { _id: userId },
//             {
//               $set: {
//                 password: bcryptedpassword,
//                 logModifiedDate: logDate,
//               },
//             },
//             {
//               new: true,
//             }
//           );
//         } else {
//           // Use findOneAndUpdate for Staff
//           updateResult = await staffModel.findOneAndUpdate(
//             { _id: userId },
//             {
//               $set: {
//                 password: bcryptedpassword,
//                 logModifiedDate: logDate,
//               },
//             },
//             {
//               new: true,
//             }
//           );
//         }

//         // Check if the update was successful
//         if (
//           (userCollection === Admin && updateResult.modifiedCount > 0) ||
//           (userCollection === staffModel && updateResult)
//         ) {
//           return res
//             .status(200)
//             .json({ success: true, message: "Password updated successfully" });
//         } else {
//           return res
//             .status(500)
//             .json({ success: false, message: "Password update failed" });
//         }
//       } else {
//         return res
//           .status(400)
//           .json({ success: false, message: "New password does not match" });
//       }
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Old Password" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };

/********************************* || FORGOT PASSWORD || ****************************************/
// generate otp
exports.generateOtp = async function (req, res) {
  const user = await Admin.findOne({ email: req.body.email });
  if (user) {
    let num = "1234567890";
    let otp = "";
    let onetimePassword;
    let senderEmail = req.body.email;

    for (let i = 0; i <= 6; i++) {
      otp = otp + num[Math.floor(Math.random() * 10)];
    }
    onetimePassword = otp;
    const otpObj = new otpModel({
      otp: onetimePassword,
      emailId: senderEmail,
      userId: user._id,
    });
    const otpSave = otpObj.save();

    if (otpSave) {
      const userData = await Admin.findOne(
        { email: senderEmail },
        { _id: 1, email: 1 }
      );
      let userInfo = userData._id;

      // template engine for forgot password
      const emailData = {
        name: userData.name,
        email: userData.email,
        otp: onetimePassword,
      };

      // require("../../views/otpEmail.ejs")
      const emailTemplatePath = path.join(
        __dirname,
        "../../views/otpEmail.ejs"
      );

      const emailTemplateFile = fs.readFileSync(emailTemplatePath, "utf-8");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smptp.gmail.com",
        port: "5013",
        auth: {
          //user: "shivaprasad.etika@gmail.com",
          // pass: "kxexyyesdwqrwhdh",
          user: "sandeep.digitalraiz@gmail.com",
          pass: "plmt hzbf jbsr wrva",
        },
        secureconnection: "false",
        tls: {
          ciphers: "SSLv3",
          rejectUnauthorized: false,
        },
      });
      console.log(senderEmail);
      let mailOptions = {
        //from: "shivaprasad.etika@gmail.com",
        from: "sandeep.digitalraiz@gmail.com",

        to: `${senderEmail}`,
        attachements: [
          {
            filename: "",
            path: "http://193.203.160.181:5013/uploads/profileImg/1705651734125-Infame.png",
            cid: "indfame",
          },
        ],
        subject: "Forgot password OTP",
        html: ejs.render(emailTemplateFile, emailData),
      };
      transporter.sendMail(mailOptions, function (error, success) {
        if (error) {
          console.log(error);
        }
        if (success) {
          console.log(success);
        }
      });
      const updateOtp = await otpModel.updateOne(
        { _id: otpObj._id },
        {
          $set: {
            userId: userData._id,
          },
        },
        {
          new: true,
        }
      );
      return res.status(200).json({
        success: true,
        message: "Otp has been sent successfully to specified email",
        userInfo: userInfo,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "User is not registered with this email",
    });
  }
};

// compare otp
exports.compareOtp = async function (req, res) {
  try {
    const otpResult = await otpModel
      .findOne({ userId: req.body._id })
      .sort({ createdAt: -1 });

    if (!otpResult) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this user" });
    }

    if (req.body.emailOtp === otpResult.otp) {
      return res
        .status(200)
        .json({ success: true, message: "Otp has been verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Otp" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// reset password
exports.resetpassword = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const showEmail = await otpModel.findOne({ userId: req.body.userId });
    console.log("User ID---------:", req.body.userId);

    console.log(showEmail);
    if (showEmail) {
      const { newpassword, confirmpassword } = req.body;
      if (newpassword === confirmpassword) {
        let bcryptedpassword = bcrypt.hashSync(confirmpassword, 10);

        const showUser = await Admin.updateOne(
          { _id: req.body.userId },
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
        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: "5012",
          auth: {
            //user: "shivaprasad.etika@gmail.com",
            // pass: "kxexyyesdwqrwhdh",
            user: "sandeep.digitalraiz@gmail.com",
            pass: "plmt hzbf jbsr wrva",
          },
          secureconnection: "false",
          tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: "false",
          },
        });
        let mailOptions = {
          //from: "shivaprasad.etika@gmail.com",

          from: "sandeep.digitalraiz@gmail.com",

          to: `${showEmail.emailId}`,
          subject: "Reset password",
          html: `<p style="color : Black; font-size: 15px">Hi There, <br> You have successfully reset your password.</p>`,
        };
        transporter.sendMail(mailOptions, function (error, success) {
          if (error) {
            console.log(error);
          }
          if (success) {
            console.log("Email sent successfully");
          }
        });
        return res.status(200).json({
          message:
            "The password has reset successfully.Please login with your new password",
        });
      } else {
        return res.status(400).json({ message: "Invalid password" });
      }
    } else {
      return res.status(400).json({ message: "Invalid  User Data" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

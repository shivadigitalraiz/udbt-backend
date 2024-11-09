// importing models
const policieModel = require("../../model/policies");
const { DateTime } = require("luxon");
// apis
exports.getPolicies = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const policy = await policieModel.findOne({});

    if (policy === null) {
      const policyObj = new policieModel({
        privacyPolicy: "",
        termsAndCondition: "",
        //refundPolicy: "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });
      const savepolicy = await policyObj.save();
      if (savepolicy) {
        return res.status(200).json({
          success: true,
          message: "Policies data have been retrieved successfully",
          policy: savepolicy ?? {},
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Policies  data has been retrieved successfully",
        policy: policy ?? {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

// update privacyPolicy
exports.updatePrivacypolicy = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const upSet = await policieModel.updateOne(
      {},
      {
        $set: {
          privacyPolicy: req.body.privacyPolicy, 
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );
    if (upSet) {
      return res.status(200).json({
        success: true,
        message: "Privacy policy has been updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Privacy policy could not be updated",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};
// update terms&condition
exports.updatetermsConditions = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const upSet = await policieModel.updateOne(
      {},
      {
        $set: {
          termsAndCondition: req.body.termsAndCondition,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );
    if (upSet) {
      return res.status(200).json({
        success: true,
        message: "Terms And Conditions has been updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Terms And Conditions could not be updated",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

//refund policy
// exports.updaterefundPolicy = async function (req, res) {
//   try {
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });
//     const time = istDateTime.toFormat("hh:mm a");

//     const upSet = await policieModel.updateOne(
//       {},
//       {
//         $set: {
//           refundPolicy: req.body.refundPolicy,
//           logModifiedDate: logDate,
//         },
//       },
//       { new: true }
//     );
//     if (upSet) {
//       return res.status(200).json({
//         success: true,
//         message: "Refund policy has been updated successfully",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Refund policy could not be updated",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };

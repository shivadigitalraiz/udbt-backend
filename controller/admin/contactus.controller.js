// importing models
const contactusModel = require("../../model/contactus");
const { DateTime } = require("luxon");

// get contactus
exports.getcontactus = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const contactus = await contactusModel.findOne({});

    if (contactus === null) {
      const contactusObj = new contactusModel({
        name: "",
        phone: "",
        email: "",
        fromTime: "",
        toTime: "",

         description: "",
        alternatePhone: "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });
      const savecontactus = await contactusObj.save();
      if (savecontactus) {
        return res.status(200).json({
          success: true,
          message: "Contatcus data has been retrived successfully",
          contactus: savecontactus ?? {},
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Contactus data has been retrived successfully",
        contactus: contactus ?? {},
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// update contactus
exports.editcontactus = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const Upcontactus = await contactusModel.updateOne(
      {},
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          fromTime: req.body.fromTime,
          toTime: req.body.toTime,
          description: req.body.description,
          //
          alternatePhone: req.body.alternatePhone,
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (Upcontactus) {
      return res
        .status(200)
        .json({ success: true, message: "Updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

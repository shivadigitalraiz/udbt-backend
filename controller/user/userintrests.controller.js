// importing models
const intrestsModel = require("../../model/intrests");
const { DateTime } = require("luxon");
const contactusModel = require("../../model/contactus");
const aboutusModel = require("../../model/aboutus");
const userModel = require("../../model/user");

//get all intrests
exports.getallintrests = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }],
      };
    }

    condition.status = "active";
    console.log(condition);

    const intrests = await intrestsModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (intrests) {
      res.status(200).json({
        success: true,
        message: "Intrest's have been retrived successfully ",
        intrests: intrests,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

exports.getcontactusandaboutus = async function (req, res) {
  try {
    const contactus = await contactusModel.findOne({});

    const aboutus = await aboutusModel.findOne({});

    res.status(200).json({
      success: true,
      message: "Data retrived successfully",
      contactus,
      aboutus,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//importing models
const intrestsModel = require("../../model/intrests");
const adminModel = require("../../model/admin");
const { DateTime } = require("luxon");

// add intrests
exports.addintrests = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const intrestsObj = new intrestsModel({
      name: req.body.name,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    const savebanner = await intrestsObj.save();

    if (savebanner) {
      res.status(200).json({ success: true, message: "Added successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// getAll banner
exports.getallintrests = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }],
      };
    }

    console.log(condition);
    const intrests = await intrestsModel
      .find(condition)
      .sort({ logCreatedDate: -1 });
    if (intrests) {
      res.status(200).json({
        success: true,
        message: "Intrest's has been retrived successfully ",
        intrests: intrests,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// edit intrests
exports.editintrests = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const banner = await intrestsModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          status: req.body.status,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );
    if (banner) {
      res.status(200).json({ success: true, message: "Updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// delete banner
exports.deleteintrest = async function (req, res) {
  try {
    const deleteintrests = await intrestsModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (deleteintrests) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

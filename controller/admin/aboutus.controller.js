// importing models
const Aboutus = require("../../model/aboutus");
const { DateTime } = require("luxon");

// get contact us details
exports.getaboutus = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const aboutus = await Aboutus.findOne({});

    if (aboutus === null) {
      const aboutusObj = new Aboutus({
        title: "",
        image: "",
        description: "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });
      const saveaboutus = await aboutusObj.save();
      if (saveaboutus) {
        return res.status(200).json({
          success: true,
          message: "About us data has been retrieved successfully",
          aboutus: saveaboutus ?? {},
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "About us data has been retrieved successfully",
        aboutus: aboutus ?? {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

// update contact us details
exports.editaboutus = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const aboutus = await Aboutus.updateOne(
      {},
      {
        $set: {
          title: req.body.title,
          // image: req.file ? req.file.path : "",
          image: req.files.image
            ? req.files.image[0].path
            : console.log("No Img"),
          description: req.body.description,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (aboutus) {
      res.status(200).json({
        success: true,
        message: "Updated successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

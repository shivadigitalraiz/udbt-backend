const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyAdminToken = async function (req, res, next) {
  try {
    console.log(req.url, "++++++++++++++++++++++++++++++++++++++++++++++++++");
    let expired = null;
    const bearerHeader = req.headers["authorization"];
    let bearerToken = "";
    if (bearerHeader) {
      bearerToken = bearerHeader.split(" ")[1];
    }
    console.log(bearerToken, "token++++++++++++++++++");
    if (bearerToken) {
      jwt.verify(
        bearerToken,
        process.env.ADMIN_SECRET_KEY,
        function (err, decoded) {
          if (err) {
            try {
              expired = err;
              res.status(401).json({
                status: false,
                message: "Your session has expired. Please login.",
                expired,
              });
            } catch (err) {
              res.status(401).json({
                status: false,
                message: "Your session has expired. Please login.",
                err,
              });
            }
          }
          if (decoded) {
            req.userId = decoded.userId;
            req.staffId = decoded.staffId;
            req.loginTime = decoded.iat;

            console.log(req.userId, "hello");
            //iat: 1666000967,
            // exp: 1666087367
            next();
          }
        }
      );
    } else {
      res
        .status(400)
        .json({ status: false, message: "Bearer token not defined" });
    }
  } catch (err) {
    console.log("eror", err);
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: false, message: "Session Expired Error", Error: err });
    } else {
      res
        .status(401)
        .json({ status: false, message: "Internal Server Error", error: err });
    }
  }
};

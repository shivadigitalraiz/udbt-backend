// import librraries
const multer = require("multer");

// middleware for uploading the profileImg
const profileImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/profileImg");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const profileImgMaxSize = 300 * 1024 * 1024;
exports.upload_profileImg = multer({
  storage: profileImgStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.originalname.match(
        /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS)$/
      )
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("This file extension is not allowed"));
    }
  },
  limits: { fileSize: profileImgMaxSize },
});

// middleware for uploading the bannerImg
const userImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/userImg");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const userImgMaxSize = 30 * 1024 * 1024;
exports.upload_userImg = multer({
  storage: userImgStorage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(png|PNG|jpg|pdf)$/)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("This file extension is not allowed"));
    }
  },
  limits: { fileSize: userImgMaxSize },
});

// middleware for uploading the aboutusImg
const aboutusImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/aboutusImg");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const aboutusImgMaxSize = 30 * 1024 * 1024;
exports.upload_aboutusImg = multer({
  storage: aboutusImgStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.originalname.match(
        /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS)$/
      )
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("This file extension is not allowed"));
    }
  },
  limits: { fileSize: aboutusImgMaxSize },
});

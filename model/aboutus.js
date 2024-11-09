const mongoose = require("mongoose");
const aboutus = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  logCreatedDate: {
    type: String,
    trim: true,
  },
  logModifiedDate: {
    type: String,
    trim: true,
  },
});
module.exports = mongoose.model("aboutus", aboutus);

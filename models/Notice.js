const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // E.g., "Holiday Notice"
  },
  imageUrl: {
    type: String,
    required: true, // Sirf image ka path
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notice", noticeSchema);
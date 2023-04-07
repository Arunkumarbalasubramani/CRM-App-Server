const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  rights: {
    type: String,
    required: true,
    enum: ["none", "create&update", "update"],
    default: "none",
  },
  serviceRequests: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
  },
  refreshToken: { token: { type: String, required: true } },
});

module.exports = mongoose.model("Users", userModel);

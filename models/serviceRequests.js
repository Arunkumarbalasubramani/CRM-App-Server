const mongoose = require("mongoose");
const serviceRequest = new mongoose.Schema({
  requestId: { type: Number },
  customer: {
    type: mongoose.Schema.Types.String,
    ref: "Contacts",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["created", "open", "inProcess", "released", "canceled", "completed"],
    default: "created",
  },
  assignedTo: {
    type: mongoose.Schema.Types.String,
    ref: "Users",
    required: true,
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("ServiceRequest", serviceRequest);

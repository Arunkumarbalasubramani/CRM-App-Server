const mongoose = require("mongoose");

const leadsSchema = new mongoose.Schema({
  leadName: {
    type: String,
    required: true,
  },
  leadEmail: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },
  leadSource: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "lost", "canceled", "confirmed"],
    default: "new",
  },
});

module.exports = mongoose.model("Leads", leadsSchema);

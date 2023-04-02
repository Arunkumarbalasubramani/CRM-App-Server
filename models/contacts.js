const mongoose = require("mongoose");
const contactsSchema = new mongoose.Schema({
  contactName: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Contacts", contactsSchema);

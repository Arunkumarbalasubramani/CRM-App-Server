const mongoose = require("mongoose");

const connection = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("DataBase is now connected");
};
module.exports = connection;

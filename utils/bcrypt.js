const bcrypt = require("bcrypt");

const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePassword = async (loginPassword, dbPassword) => {
  const response = await bcrypt.compare(loginPassword, dbPassword);
  return response;
};
module.exports = { generateHashedPassword, comparePassword };

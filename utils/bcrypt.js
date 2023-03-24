const bcrypt = require("bcrypt");

const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};
module.exports = generateHashedPassword;

// router.post("/register_user", async (req, res) => {
//     try {
//       const userEmail = req.body.email;
//       const isUser = await Users.findOne({ email: userEmail });
//       if (isUser) {
//         res.status(404).json({ Error: "User Already Found" });
//       } else {
//         const passwordToBeHashed = req.body.password;
//         const hashedPassword = await generateHashedPassword(passwordToBeHashed);
//         const userData = {
//           email: req.body.email,
//           fname: req.body.fname,
//           lname: req.body.lname,
//           password: hashedPassword,
//           userType: req.body.userType,
//         };
//         const user = new Users(userData);
//         await user.save();
//         res.status(201).json({ Message: "User Added Successfully", user });
//       }
//     } catch (error) {
//       res.status(500).json({ Error: `${error}` });
//     }
//   });

const express = require("express");
const router = express.Router();
const generateHashedPassword = require("../utils/bcrypt");
const Users = require("../models/userModel");

router.get("/", (req, res) => {
  res.send("Welcome to User Routes");
});

router.post("/register_user", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const isUser = await Users.findOne({ email: userEmail });
    if (isUser) {
      res.status(404).json({ Error: "User Already Found" });
    } else {
      const passwordToBeHashed = req.body.password;
      const hashedPassword = await generateHashedPassword(passwordToBeHashed);
      const user = new Users({ ...req.body, password: hashedPassword });
      await user.save();
      res.status(201).json({ Message: "User Added Successfully", user });
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

module.exports = router;

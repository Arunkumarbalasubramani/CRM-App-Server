const express = require("express");
const router = express.Router();
const { generateHashedPassword, comparePassword } = require("../utils/bcrypt");
const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.get("/", async (req, res) => {
  try {
    const userData = await Users.find({});
    res.send(userData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.get("/find/:useremail", async (req, res) => {
  try {
    const { useremail } = req.params;
    const userData = await Users.findOne({ email: useremail });
    res.send(userData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/delete/:useremail", async (req, res) => {
  try {
    const { useremail } = req.params;
    const userData = await Users.findOneAndDelete({ email: useremail });

    res.status(201).json({ Messgae: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/register_user", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const isUser = await Users.findOne({ email: userEmail });
    if (isUser) {
      res.status(403).json({ Error: "User Already Found" });
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

router.post("/login", async (req, res) => {
  try {
    const userDatafromDB = await Users.findOne({ email: req.body.email });
    if (!userDatafromDB) {
      res.status(404).json({ Error: "User Not found" });
    } else {
      const isPwCorrect = await comparePassword(
        req.body.password,
        userDatafromDB.password
      );
      if (isPwCorrect) {
        res.status(201).json({ Message: "User Logged In Successfully" });
      } else {
        res.status(403).json({ Error: "Wrong Credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/resetpassword", async (req, res) => {
  try {
    const userDetails = await Users.findOne({ email: req.body.email });
    if (!userDetails) {
      res.status(404).json({ Error: "User Not Found" });
    } else {
      const secret = process.env.MY_SECRET_KEY + userDetails.password;
      const token = jwt.sign(
        { email: userDetails.email, id: userDetails._id },
        secret,
        { expiresIn: "5m" }
      );

      const link = `http://localhost:3000/passwordreset/${userDetails._id}/${token}`;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN_MAIL,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const options = {
        from: process.env.ADMIN_MAIL,
        to: userDetails.email,
        subject: "Password Reset Verification ",
        text: ` We have receieved a request for Password Verification
        Please Click on the Below Link to reset Your Password\
        ${link}
        `,
      };

      transporter.sendMail(options, (err, data) => {
        if (err) {
          res.status(403).json({ Error: `${err}` });
        } else {
          res
            .status(201)
            .json({ Message: "Mail Sent To Your registered Mail Id", link });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/passwordreset/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;

    const userDetails = await Users.findById(id);
    if (!userDetails) {
      res.status(404).json({ Error: `User Not found` });
    } else {
      const secret = process.env.MY_SECRET_KEY + userDetails.password;
      const verifyToken = jwt.verify(
        token,
        secret,
        async (err, decodedToken) => {
          if (err) {
            res.status(403).json({ Error: "Invalid Token" });
          } else {
            const now = Date.now().valueOf() / 1000;
            if (decodedToken.exp < now) {
              res.status(403).json({ Error: "Token Expired" });
            } else {
              const hashedPassword = await generateHashedPassword(
                req.body.password
              );
              userDetails.password = hashedPassword;
              userDetails.save();
              res.status(201).json({ Message: "Password Updated Succesfully" });
            }
          }
        }
      );
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/change-rights", async (req, res) => {
  const usertoBeChanged = await Users.findByIdAndUpdate(req.body.userId, {
    rights: req.body.updatedRights,
  });
  res
    .status(201)
    .json({ Message: `Rights Changed for the User- ${usertoBeChanged.fname}` });
});

router.post("/change-role", async (req, res) => {
  const usertoBeChanged = await Users.findByIdAndUpdate(req.body._id, {
    role: req.body.role,
  });
  res
    .status(201)
    .json({ Message: "Roles Changed for the User- " + usertoBeChanged.fname });
});

module.exports = router;

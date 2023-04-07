const express = require("express");
const router = express.Router();
const { generateHashedPassword, comparePassword } = require("../utils/bcrypt");
const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const verifyJWT = require("../middleware/verifyToken");

//API for All Users
router.get("/", async (req, res) => {
  try {
    const userData = await Users.find({});
    res.send(userData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

//API for Finding the User by userEmail
router.get("/find/:useremail", async (req, res) => {
  try {
    const { useremail } = req.params;
    const userData = await Users.findOne({ email: useremail });
    res.send(userData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

//API for Deleting the Users
router.post("/delete/:useremail", async (req, res) => {
  try {
    const { useremail } = req.params;
    const userData = await Users.findOneAndDelete({ email: useremail });

    res.status(201).json({ Messgae: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

//API for registering the User
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

//API for generating password reset Link
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

//API for resetting the Password
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

//API for Changing the rights of the employees
router.post("/change-rights", async (req, res) => {
  const usertoBeChanged = await Users.findByIdAndUpdate(req.body.userId, {
    rights: req.body.updatedRights,
  });
  res
    .status(201)
    .json({ Message: `Rights Changed for the User- ${usertoBeChanged.fname}` });
});

//API for Changing the Role of Users
router.post("/change-role", async (req, res) => {
  const usertoBeChanged = await Users.findByIdAndUpdate(req.body._id, {
    role: req.body.role,
  });
  res
    .status(201)
    .json({ Message: "Roles Changed for the User- " + usertoBeChanged.fname });
});

//Login API
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
        const accessToken = jwt.sign(
          {
            userName: userDatafromDB.fname,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );
        const refreshToken = jwt.sign(
          {
            userName: userDatafromDB.fname,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        const saveToken = await Users.findOneAndUpdate(
          { _id: userDatafromDB._id },
          { $set: { refreshToken: { token: refreshToken } } },
          { new: true }
        );
        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "None",
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ accessToken });
      } else {
        res.status(403).json({ Error: "Wrong Credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

//API for Generating a Refresh token
router.post("/login/refreshToken", async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(401);
    }
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;

    const userDatafromDB = await Users.findOne({
      refreshToken: { token: refreshToken },
    });
    if (!userDatafromDB) {
      res.status(403).json({ Error: "Forbidden" });
    } else {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decodedData) => {
          if (err) {
            return res.status(403).json({ Message: "Invalid Token" });
          }
          const accessToken = jwt.sign(
            { userName: decodedData.userName },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "5m" }
          );
          return res.json({ accessToken });
        }
      );
    }
  } catch (error) {
    return res.status(500).json({ Error: `${error}` });
  }
});

//Logout API
router.get("/logout", async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    const userDatafromDB = await Users.findOne({
      refreshToken: { token: refreshToken },
    });
    if (!userDatafromDB) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.sendStatus(204);
    }
    await Users.updateOne(
      { refreshToken: { token: refreshToken } },
      { $set: { refreshToken: { token: "" } } }
    );
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: false,
    });
    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ Error: `${error}` });
  }
});

module.exports = router;

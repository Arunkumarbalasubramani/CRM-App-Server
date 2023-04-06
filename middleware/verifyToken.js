const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ Error: "Missing Authourization in Header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ Error: "Missing Token" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ Error: "Invalid Token" });
    }
    req.user = user.userName;
    next();
  });
};

module.exports = verifyJWT;

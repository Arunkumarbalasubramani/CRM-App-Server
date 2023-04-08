const jwt = require("jsonwebtoken");

const verifyJWTAndRole = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ Error: "Missing Token" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedData) => {
      if (err) {
        return res.status(403).json({ Error: "Invalid Token" });
      }
      if (!allowedRoles.includes(decodedData.roles)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = decodedData.userName;
      req.roles = decodedData.roles;

      next();
    });
  };
};

module.exports = verifyJWTAndRole;

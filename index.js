const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const connection = require("./db/connection");
const userRoutes = require("./routes/user");
const crmTaskRoutes = require("./routes/crmtasks");
const corsOptions = require("./config/corsOptions");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
app.use(cors(corsOptions));
app.use(credentials);

app.use(express.json());
app.use(cookieParser());
connection();
app.use("/users", userRoutes);
app.use("/crm", crmTaskRoutes);
const PORT = 5000;

app.get("/", (req, res) => {
  res.send({ Message: "Welcome to CRM App" });
});
app.listen(PORT, () => {
  console.log(`Server Started and Running in the Port -${PORT}`);
});

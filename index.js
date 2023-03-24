const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const connection = require("./db/connection");
const userRoutes = require("./routes/user");
app.use(cors());
app.use(express.json());
connection();
app.use("/users", userRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.send({ Message: "Welcome to CRM App" });
});
app.listen(PORT, () => {
  console.log(`Server Started and Running in the Port -${PORT}`);
});

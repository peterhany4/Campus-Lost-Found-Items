const express = require("express");

const authRouter = require("./Routers/auth.router");
const userRouter = require("./Routers/user.router");

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "Campus Lost & Found API" });
});

module.exports = app;
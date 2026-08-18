const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Campus Lost & Found API" });
});

module.exports = app;
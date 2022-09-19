const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./authRouter");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGO_URL;
const app = express();

// express can parse json
app.use(express.json());
app.use("/auth", authRouter);

async function start() {
  try {
    await mongoose.connect(DB);
    app.listen(PORT, () => console.log("Server started on port ", PORT));
  } catch (error) {
    console.log(error);
  }
}

start();

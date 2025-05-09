import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import "./models/taskModel.js";
import "./models/userModel.js";
import "./models/adminModel.js";
import "./models/studentModel.js";
import "./models/projectModel.js";
import "./models/messageModel.js";

const app = express();

app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("Connection error:", err);
});

db.once("open", () => {
  console.log("Successfully connected to the database!");
});

setInterval(() => {
  console.log(`Current connection status: ${mongoose.connection.readyState}`);
}, 5000);

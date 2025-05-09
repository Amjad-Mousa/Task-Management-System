import mongoose from "mongoose";
import "./models/taskModel.js";
import "./models/userModel.js";
import "./models/adminModel.js";
import "./models/studentModel.js";
import "./models/projectModel.js";
import "./models/messageModel.js";

const mongoURI = "mongodb+srv://TMS_Admin:TMS_Admin_2025@database.u7t0edf.mongodb.net/myDatabase?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
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

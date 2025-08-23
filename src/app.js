require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const Transcription = require("./models/Transcription");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB()
  .then(async () => {
    console.log("Database connection established...");

    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err.message);
  });

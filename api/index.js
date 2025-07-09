// backend/api/index.js

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const connectDB = require("../config/db");
const userRoutes = require("../routes/userRoutes");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("../middleware/errorHandler");

// Connect DB (only once in serverless)
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: "PUT,POST,GET,DELETE,PATCH,HEAD",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Vercel backend!" });
});

app.use(notFound);
app.use(errorHandler);

// Export the handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);

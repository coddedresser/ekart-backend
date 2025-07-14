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

const allowedOrigins = [
  "http://localhost:5173", 
  "https://ecommerce-nine-mu-70.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 👇 MUST BE FIRST (debugging layer)
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.use(cors({
  origin: "http://localhost:5174",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT || 5001}`);
});
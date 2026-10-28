
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use("/api/reviews", reviewRoutes);
app.use(express.static("public"));

// Test route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CodeSense AI server is running - DEBUG CHECK 123"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CodeSense AI running at http://localhost:${PORT}`);
});

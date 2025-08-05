const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,X-Requested-With",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Set additional headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/unisphere", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
const alertRoutes = require("./routes/alertRoutes");
app.use("/api/alerts", alertRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: http://localhost:5173`);
});

module.exports = app;

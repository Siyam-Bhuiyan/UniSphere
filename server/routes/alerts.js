import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import Alert from "../models/Alert.js";

const router = express.Router();

// Handle OPTIONS requests specifically for /:id route
router.options("/:id", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Get all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find({
      status: { $in: ["active", "pending"] },
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean(); // Use lean() for better performance

    // Ensure we always return an array
    res.json(alerts || []);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create new alert
router.post("/", async (req, res) => {
  try {
    console.log("Received alert data:", req.body); // Debug log

    if (!req.body.category || !req.body.message) {
      return res.status(400).json({
        message: "Category and message are required",
      });
    }

    const alert = new Alert({
      category: req.body.category,
      message: req.body.message,
      location: req.body.location,
      status: "active",
      user: req.user?.id || null, // Make reportedBy optional
    });

    const newAlert = await alert.save();
    console.log("Created alert:", newAlert); // Debug log
    res.status(201).json(newAlert);
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get alerts for a user
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts" });
  }
});

// Get all alerts (admin only)
router.get("/admin", authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const alerts = await Alert.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts" });
  }
});

// Update alert status
router.patch("/:id", async (req, res) => {
  try {
    console.log(`Updating alert ${req.params.id} with data:`, req.body);
    
    // Find the alert
    const {id} = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      console.log(`Alert not found with ID: ${id}`);
      return res.status(404).json({ message: "Alert not found" });
    }

    // Validate status if provided
    if (req.body.status) {
      const validStatuses = ["active", "pending", "resolved", "dismissed"];
      if (!validStatuses.includes(req.body.status)) {
        console.log(`Invalid status: ${req.body.status}`);
        return res.status(400).json({
          message:
            "Invalid status. Must be one of: " + validStatuses.join(", "),
        });
      }
      
      alert.status = req.body.status;
      
      // Set handled timestamp if moving to resolved/dismissed
      if (["resolved", "dismissed"].includes(req.body.status)) {
        alert.handledAt = new Date();
      }
    }

    // Update other fields if provided
    if (req.body.message) alert.message = req.body.message;
    if (req.body.location) alert.location = req.body.location;
    if (req.body.category) alert.category = req.body.category;

    // Save the updated alert
    const updatedAlert = await alert.save();
    console.log("Alert updated successfully:", updatedAlert);

    res.json({
      message: "Alert updated successfully",
      alert: updatedAlert,
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(400).json({
      message: "Error updating alert",
      error: error.message,
    });
  }
});

// Update alert status and response (admin only)
router.patch("/:id/admin", authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        adminResponse: req.body.adminResponse,
      },
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Error updating alert" });
  }
});

export default router;

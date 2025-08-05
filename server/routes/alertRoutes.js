const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// Make sure to handle OPTIONS requests for CORS preflight
router.options("/:id", (req, res) => {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.status(204).end();
});

// Create new alert
router.post("/", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update alert status
router.patch("/:id", async (req, res) => {
  try {
    console.log(`Received PATCH request for alert ${req.params.id}:`, req.body);

    // Find the alert
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Validate status if provided
    if (req.body.status) {
      const validStatuses = ["active", "pending", "resolved", "dismissed"];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid status. Must be one of: " + validStatuses.join(", "),
        });
      }
      alert.status = req.body.status;
      alert.handledAt = new Date();
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

module.exports = router;

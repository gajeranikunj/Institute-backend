const express = require("express");
const router = express.Router();
const {
  createWhatsApptext,
  getWhatsApptexts,
  getWhatsApptextById,
  updateWhatsApptext,
  deleteWhatsApptext,
  setActiveWhatsApptext,
} = require("../controllers/WhatsApptextController");

// Routes
router.post("/", createWhatsApptext);       // Create
router.get("/", getWhatsApptexts);          // Get all
router.get("/:id", getWhatsApptextById);    // Get single
router.put("/:id", updateWhatsApptext);     // Update
router.delete("/:id", deleteWhatsApptext);  // Delete
router.put("/:id/set-active", setActiveWhatsApptext); // Set active

module.exports = router;

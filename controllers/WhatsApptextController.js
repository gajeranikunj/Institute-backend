const WhatsApptext = require("../models/WhatsApptext");

// Create a new WhatsApptext
const createWhatsApptext = async (req, res) => {
  try {
    const { beforename, aftername, status } = req.body;
    if (!beforename) {
      return res.status(400).json({ message: "Before name is required" });
    }
    const newWhatsApptext = new WhatsApptext({ beforename, aftername, status });
    await newWhatsApptext.save();
    res.status(201).json({ message: "WhatsApptext created successfully", WhatsApptext: newWhatsApptext });
  } catch (error) {
    res.status(500).json({ message: "Error creating WhatsApptext", error: error.message });
  }
};

// Get all WhatsApptexts
const getWhatsApptexts = async (req, res) => {
  try {
    const texts = await WhatsApptext.find().sort({ createdAt: -1 });
    res.status(200).json(texts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching WhatsApptexts", error: error.message });
  }
};

// Get by ID
const getWhatsApptextById = async (req, res) => {
  try {
    const text = await WhatsApptext.findById(req.params.id);
    if (!text) return res.status(404).json({ message: "Not found" });
    res.status(200).json(text);
  } catch (error) {
    res.status(500).json({ message: "Error fetching WhatsApptext", error: error.message });
  }
};

// Update
const updateWhatsApptext = async (req, res) => {
  try {
    const { status } = req.body;

    // If status is being set to "active", deactivate all others first
    if (status === "active") {
      await WhatsApptext.updateMany({}, { status: "inactive" });
    }

    const text = await WhatsApptext.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!text) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Updated successfully", WhatsApptext: text });
  } catch (error) {
    res.status(500).json({ message: "Error updating WhatsApptext", error: error.message });
  }
};


// Delete
const deleteWhatsApptext = async (req, res) => {
  try {
    const text = await WhatsApptext.findByIdAndDelete(req.params.id);
    if (!text) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting WhatsApptext", error: error.message });
  }
};

// Set one active at a time
const setActiveWhatsApptext = async (req, res) => {
  try {
    await WhatsApptext.updateMany({}, { status: "inactive" }); // deactivate all
    const updated = await WhatsApptext.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Activated successfully", WhatsApptext: updated });
  } catch (error) {
    res.status(500).json({ message: "Error setting active WhatsApptext", error: error.message });
  }
};

module.exports = {
  createWhatsApptext,
  getWhatsApptexts,
  getWhatsApptextById,
  updateWhatsApptext,
  deleteWhatsApptext,
  setActiveWhatsApptext,
};

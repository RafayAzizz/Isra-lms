const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");

// URLs for API
router.post("/add", alertController.addAlert);
router.get("/get", alertController.getAlert);
router.delete("/delete", alertController.deleteAlert);

module.exports = router;
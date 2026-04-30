const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

// API URLs
router.post("/add", departmentController.addDepartment);
router.get("/all", departmentController.getAllDepartments);
router.put("/update/:id", departmentController.updateDepartment);
router.delete("/delete/:id", departmentController.deleteDepartment);

module.exports = router;
const Department = require("../models/department");

// Logic 1: Add New Department
exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: "Department Name and Code are required" });
    }

    // Check if department already exists
    const existingDept = await Department.findOne({ $or: [{ name }, { code }] });
    if (existingDept) {
      return res.status(400).json({ error: "Department with this Name or Code already exists" });
    }

    const newDepartment = new Department({
      name,
      code,
    });

    await newDepartment.save();
    res.status(201).json({ message: "Department Added Successfully!", data: newDepartment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add department" });
  }
};

// Logic 2: Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    // Latest departments pehle ayenge
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json({ data: departments });
  } catch (error) {
    res.status(500).json({ error: "Error fetching departments" });
  }
};

// Logic 3: Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name, code },
      { new: true, runValidators: true } // new: true se updated data return hota hai
    );

    if (!updatedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department Updated Successfully", data: updatedDepartment });
  } catch (error) {
    res.status(500).json({ error: "Failed to update department" });
  }
};

// Logic 4: Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDepartment = await Department.findByIdAndDelete(id);

    if (!deletedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete department" });
  }
};
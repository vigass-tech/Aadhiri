const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public (for active list) / Private (for full management)
const getDepartments = async (req, res, next) => {
  try {
    const { activeOnly, search } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query).sort({ name: 1 });

    // Include statistics for each department if requested by an admin
    let results = departments;
    if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN')) {
      results = await Promise.all(
        departments.map(async (dept) => {
          const totalComplaints = await Complaint.countDocuments({ department: dept._id });
          const pendingComplaints = await Complaint.countDocuments({
            department: dept._id,
            status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] }
          });
          const resolvedComplaints = await Complaint.countDocuments({
            department: dept._id,
            status: 'RESOLVED'
          });
          const staffCount = await User.countDocuments({
            $or: [{ department: dept._id }, { assignedDepartments: dept._id }]
          });

          return {
            ...dept.toObject(),
            stats: {
              totalComplaints,
              pendingComplaints,
              resolvedComplaints,
              staffCount
            }
          };
        })
      );
    }

    res.status(200).json({
      success: true,
      count: results.length,
      departments: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department details
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const totalComplaints = await Complaint.countDocuments({ department: department._id });
    const staff = await User.find({
      $or: [{ department: department._id }, { assignedDepartments: department._id }]
    }).select('name email role designation phone');

    res.status(200).json({
      success: true,
      department,
      stats: { totalComplaints, staffCount: staff.length },
      staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (SUPER_ADMIN)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head, email, phone } = req.body;

    if (!name || !code || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department name, code, and description.'
      });
    }

    const existingName = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists.'
      });
    }

    const existingCode = await Department.findOne({
      code: code.trim().toUpperCase()
    });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'A department with this code already exists.'
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      head: head || '',
      email: email || '',
      phone: phone || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head, email, phone, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Check duplicate name
    if (name && name.trim().toLowerCase() !== department.name.toLowerCase()) {
      const duplicate = await Department.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another department with this name already exists.'
        });
      }
      department.name = name.trim();
    }

    // Check duplicate code
    if (code && code.trim().toUpperCase() !== department.code) {
      const duplicate = await Department.findOne({
        code: code.trim().toUpperCase()
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another department with this code already exists.'
        });
      }
      department.code = code.trim().toUpperCase();
    }

    if (description) department.description = description.trim();
    if (head !== undefined) department.head = head;
    if (email !== undefined) department.email = email;
    if (phone !== undefined) department.phone = phone;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department with safety validation
// @route   DELETE /api/departments/:id
// @access  Private (SUPER_ADMIN)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Check if complaints are associated with this department
    const complaintCount = await Complaint.countDocuments({ department: department._id });
    if (complaintCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${complaintCount} complaints are linked to it. Deactivate the department instead.`
      });
    }

    // Check if staff members are assigned
    const staffCount = await User.countDocuments({
      $or: [{ department: department._id }, { assignedDepartments: department._id }]
    });
    if (staffCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${staffCount} staff members are assigned to it.`
      });
    }

    await Department.findByIdAndDelete(department._id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};


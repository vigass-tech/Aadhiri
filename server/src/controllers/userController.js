const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all users (with filters: role, search, status, department)
// @route   GET /api/users
// @access  Private (SUPER_ADMIN, ADMIN)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status, department, page = 1, limit = 20 } = req.query;

    const query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Role-based restrictions:
    // Admin cannot see or manage SUPER_ADMIN users
    if (req.user.role === 'ADMIN') {
      if (!role) {
        query.role = { $in: ['REVIEWER', 'CITIZEN'] };
      } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admins cannot view or manage other Admins or Super Admins.'
        });
      }
    }

    // Filter by status (active/inactive)
    if (status !== undefined && status !== '') {
      query.isActive = status === 'true';
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Text search by name, email, phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name code')
      .populate('assignedDepartments', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department')
      .populate('assignedDepartments');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Restrict Admin from viewing Super Admin or other Admins
    if (req.user.role === 'ADMIN' && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot view details of other Admins or Super Admins.'
      });
    }

    // Get complaint history if citizen
    let complaints = [];
    if (user.role === 'CITIZEN') {
      complaints = await Complaint.find({ citizen: user._id })
        .populate('department', 'name code')
        .sort({ createdAt: -1 });
    }

    // Get assigned workload if reviewer
    let workload = null;
    if (user.role === 'REVIEWER') {
      const assignedCount = await Complaint.countDocuments({
        assignedReviewer: user._id,
        status: { $in: ['ASSIGNED', 'UNDER_REVIEW'] }
      });
      const resolvedCount = await Complaint.countDocuments({
        assignedReviewer: user._id,
        status: 'RESOLVED'
      });
      workload = { activeCount: assignedCount, resolvedCount };
    }

    res.status(200).json({
      success: true,
      user,
      complaints,
      workload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user (Admin, Reviewer, Citizen)
// @route   POST /api/users
// @access  Private (SUPER_ADMIN, ADMIN)
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, department, assignedDepartments, designation, address } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, password, and role.'
      });
    }

    // Enforce role creation permissions:
    // Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admins are permitted to create Admin accounts.'
        });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role,
      department: department || null,
      assignedDepartments: assignedDepartments || [],
      designation: designation || '',
      address: address || '',
      isActive: true
    });

    const populatedUser = await User.findById(newUser._id).populate('department');

    res.status(201).json({
      success: true,
      message: `${role} created successfully.`,
      user: populatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, department, assignedDepartments, designation, address, isActive, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Permissions check
    if (req.user.role === 'ADMIN') {
      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admins cannot modify details of Admins or Super Admins.'
        });
      }
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department !== undefined) user.department = department || null;
    if (assignedDepartments !== undefined) user.assignedDepartments = assignedDepartments;
    if (designation !== undefined) user.designation = designation;
    if (address !== undefined) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    if (password && password.trim().length >= 6) {
      user.password = password; // Trigger pre-save hook for hashing
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate('department');

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/status
// @access  Private (SUPER_ADMIN, ADMIN)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Super Admin status cannot be deactivated.'
      });
    }

    if (req.user.role === 'ADMIN' && user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot deactivate other Admins.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Super Admin account cannot be deleted.'
      });
    }

    if (req.user.role === 'ADMIN' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot delete other Admins or Super Admins.'
      });
    }

    // Check if citizen has complaints before deleting
    const complaintCount = await Complaint.countDocuments({
      $or: [{ citizen: user._id }, { assignedReviewer: user._id }]
    });

    if (complaintCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user: ${complaintCount} active complaint records are associated with this user. Deactivate the account instead.`
      });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};


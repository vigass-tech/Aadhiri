const Budget = require('../models/Budget');
const Department = require('../models/Department');

// @desc    Get all budgets with financial summaries
// @route   GET /api/budgets
// @access  Private (SUPER_ADMIN, ADMIN)
const getBudgets = async (req, res, next) => {
  try {
    const { department, financialYear, status } = req.query;
    const query = {};

    if (department) {
      query.department = department;
    }

    if (financialYear) {
      query.financialYear = financialYear;
    }

    if (status) {
      query.status = status;
    }

    // Admin scoping: if admin has assigned departments, filter unless super admin
    if (
      req.user.role === 'ADMIN' &&
      req.user.assignedDepartments &&
      req.user.assignedDepartments.length > 0 &&
      !department
    ) {
      query.department = { $in: req.user.assignedDepartments };
    }

    const budgets = await Budget.find(query)
      .populate('department', 'name code head')
      .sort({ createdAt: -1 });

    // Aggregate overall financial summary
    const summary = budgets.reduce(
      (acc, item) => {
        acc.totalAllocated += item.allocatedAmount || 0;
        acc.totalUtilized += item.utilizedAmount || 0;
        acc.totalRemaining += item.remainingAmount || 0;
        return acc;
      },
      { totalAllocated: 0, totalUtilized: 0, totalRemaining: 0 }
    );

    res.status(200).json({
      success: true,
      count: budgets.length,
      summary,
      budgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('department');
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget record not found.' });
    }

    res.status(200).json({
      success: true,
      budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget allocation
// @route   POST /api/budgets
// @access  Private (SUPER_ADMIN, ADMIN)
const createBudget = async (req, res, next) => {
  try {
    const { department, title, financialYear, allocatedAmount, utilizedAmount, description } =
      req.body;

    if (!department || !title || !financialYear || allocatedAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department, title, financial year, and allocated amount.'
      });
    }

    const numAllocated = Number(allocatedAmount);
    const numUtilized = Number(utilizedAmount || 0);

    if (isNaN(numAllocated) || numAllocated < 0) {
      return res.status(400).json({
        success: false,
        message: 'Allocated amount must be a positive number.'
      });
    }

    if (isNaN(numUtilized) || numUtilized < 0) {
      return res.status(400).json({
        success: false,
        message: 'Utilized amount must be a non-negative number.'
      });
    }

    if (numUtilized > numAllocated) {
      return res.status(400).json({
        success: false,
        message: 'Utilized amount cannot exceed the allocated amount.'
      });
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const budget = await Budget.create({
      department,
      title: title.trim(),
      financialYear: financialYear.trim(),
      allocatedAmount: numAllocated,
      utilizedAmount: numUtilized,
      description: description ? description.trim() : ''
    });

    const populated = await Budget.findById(budget._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Budget allocated successfully.',
      budget: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget record
// @route   PUT /api/budgets/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateBudget = async (req, res, next) => {
  try {
    const { department, title, financialYear, allocatedAmount, utilizedAmount, description, status } =
      req.body;

    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget record not found.' });
    }

    if (department) budget.department = department;
    if (title) budget.title = title.trim();
    if (financialYear) budget.financialYear = financialYear.trim();

    if (allocatedAmount !== undefined) {
      const numAllocated = Number(allocatedAmount);
      if (isNaN(numAllocated) || numAllocated < 0) {
        return res.status(400).json({
          success: false,
          message: 'Allocated amount must be a positive number.'
        });
      }
      budget.allocatedAmount = numAllocated;
    }

    if (utilizedAmount !== undefined) {
      const numUtilized = Number(utilizedAmount);
      if (isNaN(numUtilized) || numUtilized < 0) {
        return res.status(400).json({
          success: false,
          message: 'Utilized amount must be a non-negative number.'
        });
      }
      if (numUtilized > budget.allocatedAmount) {
        return res.status(400).json({
          success: false,
          message: 'Utilized amount cannot exceed allocated amount.'
        });
      }
      budget.utilizedAmount = numUtilized;
    }

    if (description !== undefined) budget.description = description.trim();
    if (status) budget.status = status;

    await budget.save();

    const updated = await Budget.findById(budget._id).populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      budget: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget record
// @route   DELETE /api/budgets/:id
// @access  Private (SUPER_ADMIN)
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget record not found.' });
    }

    await Budget.findByIdAndDelete(budget._id);

    res.status(200).json({
      success: true,
      message: 'Budget record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
};


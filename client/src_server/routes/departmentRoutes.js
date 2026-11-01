const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public access to list departments (activeOnly query supported)
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Protected operations
router.post('/', protect, authorize('SUPER_ADMIN'), createDepartment);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updateDepartment);
router.delete('/:id', protect, authorize('SUPER_ADMIN'), deleteDepartment);

module.exports = router;


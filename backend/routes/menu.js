const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List menu items: public (only available) or admin (all)
router.route('/')
  .get(protect, getMenuItems);

// Admin-only endpoints
router.route('/')
  .post(protect, authorize('admin'), createMenuItem);

router.route('/:id')
  .get(protect, authorize('admin'), getMenuItemById)
  .put(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

module.exports = router;

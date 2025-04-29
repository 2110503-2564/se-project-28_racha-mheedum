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

/**
 * @swagger
 * /menu:
 *   get:
 *     summary: Get menu items
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability (true/false). If not provided, admins see all, users see available.
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new menu item (Admin only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItemInput'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(protect, getMenuItems)
  .post(protect, authorize('admin'), createMenuItem);

/**
 * @swagger
 * /menu/{id}:
 *   get:
 *     summary: Get a specific menu item by ID (Admin only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu item to retrieve
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a specific menu item by ID (Admin only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItemInput' # Or a specific update schema
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a specific menu item by ID (Admin only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu item to delete
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(protect, authorize('admin'), getMenuItemById)
  .put(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuItem:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a109ce"
 *         name:
 *           type: string
 *           example: "Cappuccino"
 *         description:
 *           type: string
 *           example: "Espresso with steamed milk foam"
 *         price:
 *           type: number
 *           format: float
 *           example: 3.50
 *         category:
 *           type: string
 *           enum: [Coffee, Tea, Snack, Meal, Beverage]
 *           example: "Coffee"
 *         imageUrl:
 *           type: string
 *           format: url
 *           example: "https://example.com/images/cappuccino.jpg"
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-07-27T12:00:00.000Z"
 *
 *     MenuItemInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           example: "Latte"
 *         description:
 *           type: string
 *           example: "Espresso with steamed milk"
 *         price:
 *           type: number
 *           format: float
 *           example: 4.00
 *         category:
 *           type: string
 *           enum: [Coffee, Tea, Snack, Meal, Beverage]
 *           example: "Coffee"
 *         imageUrl:
 *           type: string
 *           format: url
 *           example: "https://example.com/images/latte.jpg"
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           example: true
 */

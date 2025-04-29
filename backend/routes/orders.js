const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All routes below require authentication
router.use(protect);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's orders
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
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (e.g., invalid items, missing reservation)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router
  .route('/')
  .get(getUserOrders)
  .post(placeOrder);

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     # Add parameters for pagination, filtering by user, status, date range etc.
 *     responses:
 *       200:
 *         description: List of all orders
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
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       500:
 *         description: Server error
 */
router.get('/admin/all', authorize('admin'), getAllOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized (User doesn't own order and is not admin)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderUpdateInput' # Define fields that can be updated (e.g., status)
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to delete
 *     responses:
 *       200:
 *         description: Order deleted successfully
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
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.route('/:orderId')
  .get(getOrderById)
  .put(authorize('admin'), updateOrder)    // Apply admin auth specifically here
  .delete(authorize('admin'), deleteOrder); // Apply admin auth specifically here

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - menuItem
 *         - quantity
 *         - priceAtOrder
 *       properties:
 *         menuItem:
 *           type: string # Or object if populated
 *           description: Reference to the MenuItem model
 *           example: "60d0fe4f5311236168a109ce"
 *         quantity:
 *           type: integer
 *           example: 2
 *         priceAtOrder:
 *           type: number
 *           format: float
 *           description: Price of the item when the order was placed
 *           example: 3.50
 *         # Add _id if needed for specific item identification within an order
 *
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - items
 *         - totalPrice
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a109cf"
 *         user:
 *           type: string # Or object if populated
 *           description: Reference to the User model
 *           example: "60d0fe4f5311236168a109ca"
 *         reservation:
 *           type: string # Optional: Link to a reservation
 *           description: Reference to the Reservation model
 *           example: "60d0fe4f5311236168a109cc"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalPrice:
 *           type: number
 *           format: float
 *           example: 7.00
 *         status:
 *           type: string
 *           enum: [pending, processing, ready, completed, cancelled]
 *           default: pending
 *           example: processing
 *         orderNotes:
 *           type: string
 *           example: "Extra shot of espresso"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-07-27T14:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-07-27T14:05:00.000Z"
 *
 *     OrderInputItem:
 *       type: object
 *       required:
 *         - menuItemId
 *         - quantity
 *       properties:
 *         menuItemId:
 *           type: string
 *           description: ID of the menu item
 *           example: "60d0fe4f5311236168a109ce"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *
 *     OrderInput:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         reservationId:
 *           type: string
 *           description: Optional ID of the reservation this order is for
 *           example: "60d0fe4f5311236168a109cc"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderInputItem'
 *         orderNotes:
 *           type: string
 *           example: "Deliver to Table 5"
 *
 *     OrderUpdateInput:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, processing, ready, completed, cancelled]
 *           example: ready
 *         # Add any other fields admins can update
 */

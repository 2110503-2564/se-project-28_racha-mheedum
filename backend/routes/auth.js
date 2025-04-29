const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    setMembership,
    getMembership
} = require('../controllers/auth'); // Make sure `setMembership` and `getMembership` are exported from auth.js

const router = express.Router();
const { protect } = require('../middleware/auth');

// Auth routes

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - tel
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               tel:
 *                 type: string
 *                 example: '0812345678'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *                 example: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (e.g., missing fields, invalid email)
 *       500:
 *         description: Server error
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=None
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Server error
 */
router.post('/logout', logout);  // Still public? You might want to protect it

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User' # Assuming you define User schema elsewhere or in controller
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *       500:
 *         description: Server error
 */
router.get('/me', protect, getMe);

// Membership routes (require authentication)

/**
 * @swagger
 * /auth/membership:
 *   post:
 *     summary: Set user's membership details (placeholder - might relate to specific membership system)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membershipId:
 *                 type: string
 *                 example: '60d0fe4f5311236168a109ca' # Example ID
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-01-01T00:00:00Z'
 *             # Add other relevant membership properties here
 *     responses:
 *       200:
 *         description: Membership updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               # Define response schema based on your controller logic
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/membership', protect, setMembership);

/**
 * @swagger
 * /auth/membership:
 *   get:
 *     summary: Get user's membership details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved membership data
 *         content:
 *           application/json:
 *             schema:
 *               # Define response schema based on your controller logic
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object # Replace with actual membership details schema
 *                   properties:
 *                     membershipId:
 *                       type: string
 *                       example: '60d0fe4f5311236168a109ca'
 *                     status:
 *                       type: string
 *                       example: 'active'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Membership not found
 *       500:
 *         description: Server error
 */
router.get('/membership', protect, getMembership);

module.exports = router;
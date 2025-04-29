const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
    getCoworkingSpaces,
    getCoworkingSpace,
    createCoworkingSpace,
    updateCoworkingSpace,
    deleteCoworkingSpace,
    getNearestCoworkingSpaces
} = require('../controllers/coworkingSpace');

// Import other resource routers
const equipmentRouter = require('./equipment'); // Import equipment router

// Re-route into other resource routers
// Note: Swagger won't automatically document nested routes defined this way.
// You might need to document equipment routes within coworkingSpace tag or separately.
router.use('/:coworkingSpaceId/equipment', equipmentRouter); // Mount equipment router for nested route

/**
 * @swagger
 * /coworking-spaces/nearest:
 *   get:
 *     summary: Find coworking spaces near a location
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude of the location
 *         example: 100.523186
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude of the location
 *         example: 13.736717
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: integer
 *         description: Maximum distance in kilometers
 *         example: 10
 *     responses:
 *       200:
 *         description: List of nearest coworking spaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CoworkingSpace'
 *       400:
 *         description: Bad request (e.g., missing coordinates)
 *       500:
 *         description: Server error
 */
router.get('/nearest', getNearestCoworkingSpaces);  // No protection for now

// Route for all coworking spaces (GET and POST)
/**
 * @swagger
 * /coworking-spaces:
 *   get:
 *     summary: Get all coworking spaces
 *     tags: [CoworkingSpaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       # Add query parameters for filtering, sorting, pagination if applicable
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Select fields to return (comma-separated)
 *         example: name,address
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by field (e.g., name, -rating)
 *         example: name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of coworking spaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 pagination:
 *                   type: object # Define pagination structure
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CoworkingSpace'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new coworking space (Admin only)
 *     tags: [CoworkingSpaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoworkingSpaceInput'
 *     responses:
 *       201:
 *         description: Coworking space created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CoworkingSpace'
 *       400:
 *         description: Bad request (e.g., missing required fields)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an admin)
 *       500:
 *         description: Server error
 */
router.route('/')
    .get(protect, getCoworkingSpaces)  // Only logged-in users can view
    .post(protect, authorize('admin'), createCoworkingSpace);  // Only admin can create

// Route for a single coworking space (GET, PUT, DELETE)
/**
 * @swagger
 * /coworking-spaces/{id}:
 *   get:
 *     summary: Get a specific coworking space by ID
 *     tags: [CoworkingSpaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the coworking space to retrieve
 *     responses:
 *       200:
 *         description: Coworking space details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CoworkingSpace'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coworking space not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a specific coworking space by ID (Admin only)
 *     tags: [CoworkingSpaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the coworking space to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoworkingSpaceInput' # Or a specific update schema
 *     responses:
 *       200:
 *         description: Coworking space updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CoworkingSpace'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an admin)
 *       404:
 *         description: Coworking space not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a specific coworking space by ID (Admin only)
 *     tags: [CoworkingSpaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the coworking space to delete
 *     responses:
 *       200:
 *         description: Coworking space deleted successfully
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an admin)
 *       404:
 *         description: Coworking space not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(protect, getCoworkingSpace)  // Only logged-in users can view
    .put(protect, authorize('admin'), updateCoworkingSpace)  // Only admin can update
    .delete(protect, authorize('admin'), deleteCoworkingSpace);  // Only admin can delete

// // Debugging: Log before calling getNearestCoworkingSpaces
// router.get('/nearest', (req, res, next) => {
//     console.log("Nearest Coworking Space Route Reached");  // Log to confirm route is hit
//     next();
// }, getNearestCoworkingSpaces); // Call the getNearestCoworkingSpaces function

// // Route for nearest coworking spaces (GET) - Duplicate route definition removed
// router.get('/nearest', getNearestCoworkingSpaces);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *           default: Point
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *             format: float
 *           example: [100.523186, 13.736717] # [longitude, latitude]
 *         formattedAddress:
 *           type: string
 *           example: "123 Main St, Bangkok, Thailand"
 *         street:
 *           type: string
 *           example: "Main St"
 *         city:
 *           type: string
 *           example: "Bangkok"
 *         state:
 *           type: string
 *           example: "Bangkok"
 *         zipcode:
 *           type: string
 *           example: "10330"
 *         country:
 *           type: string
 *           example: "Thailand"
 *
 *     CoworkingSpace:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - openTime
 *         - closeTime
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a109cb"
 *         name:
 *           type: string
 *           example: "Awesome Coworking Space"
 *         address:
 *           type: string
 *           example: "123 Tech Ave, Silicon Valley"
 *         telephoneNumber:
 *           type: string
 *           example: "02-123-4567"
 *         openTime:
 *           type: string
 *           format: time # Representing time, e.g., HH:MM
 *           example: "09:00"
 *         closeTime:
 *           type: string
 *           format: time
 *           example: "18:00"
 *         location: # Optional geo-location
 *           $ref: '#/components/schemas/Location'
 *         averageRating: # Assuming you might add ratings later
 *           type: number
 *           format: float
 *           example: 4.5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-07-27T10:00:00.000Z"
 *
 *     CoworkingSpaceInput:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - openTime
 *         - closeTime
 *       properties:
 *         name:
 *           type: string
 *           example: "New Coworking Spot"
 *         address:
 *           type: string
 *           example: "456 Innovation Rd, Tech City"
 *         telephoneNumber:
 *           type: string
 *           example: "02-987-6543"
 *         openTime:
 *           type: string
 *           format: time
 *           example: "08:00"
 *         closeTime:
 *           type: string
 *           format: time
 *           example: "20:00"
 *         # Add location input fields if needed (e.g., longitude, latitude)
 */

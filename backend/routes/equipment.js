const express = require('express');
const {
    getEquipments,
    getEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
} = require('../controllers/equipment');

const Equipment = require('../models/equipment');

// Import middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Routes for equipment management

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment (optionally filtered by coworking space)
 *     tags: [Equipment]
 *     parameters:
 *       - in: query
 *         name: coworkingSpaceId # Or however you filter by space in advancedResults
 *         schema:
 *           type: string
 *         description: Filter equipment by Coworking Space ID (if accessing via /coworking-spaces/{coworkingSpaceId}/equipment)
 *       # Add other query parameters from advancedResults (e.g., select, sort, page, limit)
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to return
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit per page
 *     responses:
 *       200:
 *         description: List of equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Equipment'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add new equipment (protected, requires auth)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipmentInput'
 *     responses:
 *       201:
 *         description: Equipment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/')
    .get(advancedResults(Equipment, {
        path: 'coworkingSpace',
        select: 'name description'
    }), getEquipments)
    .post(protect, addEquipment);

/**
 * @swagger
 * /equipment/{id}:
 *   get:
 *     summary: Get a specific equipment item by ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the equipment to retrieve
 *     responses:
 *       200:
 *         description: Equipment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Equipment'
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a specific equipment item by ID (protected)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the equipment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipmentInput' # Re-use or create specific update schema
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a specific equipment item by ID (protected)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the equipment to delete
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
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
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(getEquipment)
    .put(protect, updateEquipment)
    .delete(protect, deleteEquipment);

// Route to fetch customer's equipment requests

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - amount
 *         - coworkingSpace
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a109cd"
 *         name:
 *           type: string
 *           example: "Projector"
 *         type:
 *           type: string
 *           example: "Electronics"
 *         amount:
 *           type: integer
 *           example: 5
 *         description:
 *           type: string
 *           example: "High-definition projector for presentations"
 *         coworkingSpace:
 *           type: string # Or object if populated
 *           description: Reference to the CoworkingSpace model
 *           example: "60d0fe4f5311236168a109cb"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-07-27T11:00:00.000Z"
 *
 *     EquipmentInput:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - amount
 *         - coworkingSpace # Required when creating directly via /equipment
 *       properties:
 *         name:
 *           type: string
 *           example: "Monitor"
 *         type:
 *           type: string
 *           example: "Electronics"
 *         amount:
 *           type: integer
 *           example: 10
 *         description:
 *           type: string
 *           example: "27-inch Dell Monitor"
 *         coworkingSpace:
 *           type: string
 *           description: ID of the associated coworking space
 *           example: "60d0fe4f5311236168a109cb"
 */
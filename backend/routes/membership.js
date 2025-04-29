const express = require('express');
const {
  getMembership,
  createOrUpdateMembership,
  updatePoints,
  getAllUserMemberships,
  getAllMembershipPrograms,
  getMembershipProgram,
  createMembershipProgram,
  updateMembershipProgram,
  deleteMembershipProgram,
  getEligibleMemberships,
  chooseMembershipProgram,
  getMembershipRewards,
  redeemReward,
  getRedemptionHistory,
  getMembershipStats
} = require('../controllers/membership');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// --- User's Current Membership ---
/**
 * @swagger
 * /memberships:
 *   get:
 *     summary: Get the logged-in user's current membership details
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User membership details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMembership'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Membership not found for this user
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create or update the logged-in user's membership (e.g., initial setup or renewal)
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserMembershipInput' # Define what info is needed
 *     responses:
 *       200:
 *       201:
 *         description: Membership created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMembership'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(protect, getMembership)
  .post(protect, createOrUpdateMembership);

// --- Membership Program Selection ---
/**
 * @swagger
 * /memberships/eligible:
 *   get:
 *     summary: Get membership programs the user is eligible for
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of eligible membership programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MembershipProgram'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/eligible', protect, getEligibleMemberships);

/**
 * @swagger
 * /memberships/choose/{programId}:
 *   post:
 *     summary: Choose and activate a membership program for the user
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the membership program to choose
 *     responses:
 *       200:
 *         description: Membership program chosen successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMembership' # Return updated membership
 *       400:
 *         description: Bad request (e.g., not eligible, program not found)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Membership program not found
 *       500:
 *         description: Server error
 */
router.post('/choose/:programId', protect, chooseMembershipProgram);

// --- Rewards --- 
/**
 * @swagger
 * /memberships/rewards:
 *   get:
 *     summary: Get available rewards for the user based on their membership/points
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reward' # Define Reward schema
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User membership not found
 *       500:
 *         description: Server error
 */
router.get('/rewards', protect, getMembershipRewards);

/**
 * @swagger
 * /memberships/rewards/redeem:
 *   post:
 *     summary: Redeem a reward using membership points
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardId
 *             properties:
 *               rewardId:
 *                 type: string
 *                 description: ID of the reward to redeem
 *     responses:
 *       200:
 *         description: Reward redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object # Define response, maybe updated points or confirmation
 *               properties:
 *                  success:
 *                      type: boolean
 *                  message:
 *                      type: string
 *       400:
 *         description: Bad request (e.g., insufficient points, reward not found/available)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reward or User membership not found
 *       500:
 *         description: Server error
 */
router.post('/rewards/redeem', protect, redeemReward);

/**
 * @swagger
 * /memberships/rewards/history:
 *   get:
 *     summary: Get the logged-in user's reward redemption history
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of redeemed rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RedemptionRecord' # Define RedemptionRecord schema
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/rewards/history', protect, getRedemptionHistory);

// --- Admin Routes --- 

/**
 * @swagger
 * /memberships/users:
 *   get:
 *     summary: Get all user memberships (Admin only)
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     # Add parameters for pagination, filtering by program, status etc.
 *     responses:
 *       200:
 *         description: List of all user memberships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserMembership'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       500:
 *         description: Server error
 */
router.get('/users', protect, authorize('admin'), getAllUserMemberships);

/**
 * @swagger
 * /memberships/stats:
 *   get:
 *     summary: Get membership statistics (Admin only)
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object # Define the stats object structure
 *               properties:
 *                  totalMembers:
 *                      type: integer
 *                  activeMembersByProgram:
 *                      type: object 
 *                  # Add more stats as needed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       500:
 *         description: Server error
 */
router.get('/stats', protect, authorize('admin'), getMembershipStats);

/**
 * @swagger
 * /memberships/points/{userId}:
 *   put:
 *     summary: Update points for a specific user (Protected - How is this used? Admin action? Internal?)
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: [] # Or specific admin authorization
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose points are to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pointsChange
 *             properties:
 *               pointsChange:
 *                 type: integer
 *                 description: Amount to add (positive) or deduct (negative)
 *                 example: 50
 *               reason:
 *                 type: string
 *                 description: Optional reason for the points update
 *                 example: "Manual adjustment by admin"
 *     responses:
 *       200:
 *         description: Points updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMembership' # Return updated membership
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User membership not found
 *       500:
 *         description: Server error
 */
router.put('/points/:userId', protect, updatePoints); // Consider if authorize('admin') is needed

// --- Membership Program Management (Admin) --- 

/**
 * @swagger
 * /memberships/programs:
 *   get:
 *     summary: Get all available membership programs (Public)
 *     tags: [Membership Programs]
 *     responses:
 *       200:
 *         description: List of membership programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MembershipProgram'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new membership program (Admin only)
 *     tags: [Membership Programs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembershipProgramInput'
 *     responses:
 *       201:
 *         description: Membership program created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipProgram'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       500:
 *         description: Server error
 */
router.route('/programs')
    .get(getAllMembershipPrograms)
    .post(protect, authorize('admin'), createMembershipProgram);

/**
 * @swagger
 * /memberships/programs/{id}:
 *   get:
 *     summary: Get a specific membership program by ID (Public)
 *     tags: [Membership Programs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the membership program
 *     responses:
 *       200:
 *         description: Membership program details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipProgram'
 *       404:
 *         description: Membership program not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a membership program (Admin only)
 *     tags: [Membership Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the membership program to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembershipProgramInput'
 *     responses:
 *       200:
 *         description: Membership program updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipProgram'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not admin)
 *       404:
 *         description: Membership program not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a membership program (Admin only)
 *     tags: [Membership Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the membership program to delete
 *     responses:
 *       200:
 *         description: Membership program deleted successfully
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
 *         description: Membership program not found
 *       500:
 *         description: Server error
 */
router.route('/programs/:id')
    .get(getMembershipProgram)
    .put(protect, authorize('admin'), updateMembershipProgram)
    .delete(protect, authorize('admin'), deleteMembershipProgram);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     MembershipProgram:
 *       type: object
 *       required:
 *         - name
 *         - tier
 *         - benefits
 *         - pointsThreshold
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a10a01"
 *         name:
 *           type: string
 *           example: "Gold Member"
 *         tier:
 *           type: string
 *           enum: [Bronze, Silver, Gold, Platinum]
 *           example: "Gold"
 *         description:
 *           type: string
 *           example: "Exclusive benefits for our valued members"
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           example: ["10% discount on bookings", "Free coffee", "Priority support"]
 *         pointsThreshold:
 *           type: integer
 *           description: Minimum points required to attain this tier (if applicable)
 *           example: 1000
 *         durationMonths:
 *           type: integer
 *           description: Duration of the membership tier in months (if applicable)
 *           example: 12
 *         price:
 *           type: number
 *           format: float
 *           description: Cost to purchase/renew this membership (if applicable)
 *           example: 99.99
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     MembershipProgramInput:
 *       type: object
 *       required:
 *         - name
 *         - tier
 *         - benefits
 *       properties:
 *         name:
 *           type: string
 *           example: "Silver Member"
 *         tier:
 *           type: string
 *           enum: [Bronze, Silver, Gold, Platinum]
 *           example: "Silver"
 *         description:
 *           type: string
 *           example: "Great benefits for regular users"
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           example: ["5% discount on bookings", "Free tea"]
 *         pointsThreshold:
 *           type: integer
 *           example: 500
 *         durationMonths:
 *           type: integer
 *           example: 12
 *         price:
 *           type: number
 *           format: float
 *           example: 49.99
 *
 *     UserMembership:
 *       type: object
 *       required:
 *         - user
 *         - membershipProgram
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a10a02"
 *         user:
 *           type: string # Or object if populated
 *           description: Reference to User model
 *           example: "60d0fe4f5311236168a109ca"
 *         membershipProgram:
 *           type: string # Or object if populated
 *           description: Reference to MembershipProgram model
 *           example: "60d0fe4f5311236168a10a01"
 *         points:
 *           type: integer
 *           default: 0
 *           example: 1250
 *         status:
 *           type: string
 *           enum: [active, inactive, expired]
 *           default: active
 *           example: "active"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     UserMembershipInput: # Schema for creating/updating a UserMembership
 *       type: object
 *       # Define fields needed, e.g., programId if selecting, payment details if purchasing
 *       properties:
 *         membershipProgramId:
 *           type: string
 *           description: ID of the chosen membership program
 *           example: "60d0fe4f5311236168a10a01"
 *         # Add payment info if required for POST
 *
 *     Reward:
 *       type: object
 *       required:
 *         - name
 *         - pointsCost
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d0fe4f5311236168a10a03"
 *         name:
 *           type: string
 *           example: "Free Day Pass"
 *         description:
 *           type: string
 *           example: "Redeem points for a free day at any location"
 *         pointsCost:
 *           type: integer
 *           example: 500
 *         requiredMembershipTier:
 *           type: string
 *           enum: [Bronze, Silver, Gold, Platinum, null]
 *           description: Minimum membership tier required to redeem (null if none)
 *           example: "Silver"
 *         availability:
 *           type: boolean
 *           default: true
 *
 *     RedemptionRecord:
 *       type: object
 *       required:
 *         - user
 *         - reward
 *         - pointsSpent
 *         - redemptionDate
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string # Or object
 *           description: User who redeemed
 *         reward:
 *           type: string # Or object
 *           description: Reward that was redeemed
 *         pointsSpent:
 *           type: integer
 *         redemptionDate:
 *           type: string
 *           format: date-time
 */ 
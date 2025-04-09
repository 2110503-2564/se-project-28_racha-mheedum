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


router.get('/nearest', getNearestCoworkingSpaces);  // No protection for now

// Route for all coworking spaces (GET and POST)
router.route('/')
    .get(protect, getCoworkingSpaces)  // Only logged-in users can view
    .post(protect, authorize('admin'), createCoworkingSpace);  // Only admin can create

// Route for a single coworking space (GET, PUT, DELETE)
router.route('/:id')
    .get(protect, getCoworkingSpace)  // Only logged-in users can view
    .put(protect, authorize('admin'), updateCoworkingSpace)  // Only admin can update
    .delete(protect, authorize('admin'), deleteCoworkingSpace);  // Only admin can delete




// // Debugging: Log before calling getNearestCoworkingSpaces
// router.get('/nearest', (req, res, next) => {
//     console.log("Nearest Coworking Space Route Reached");  // Log to confirm route is hit
//     next();
// }, getNearestCoworkingSpaces); // Call the getNearestCoworkingSpaces function

// Route for nearest coworking spaces (GET)
router.get('/nearest', getNearestCoworkingSpaces);  // This route should be defined here


module.exports = router;

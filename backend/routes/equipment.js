const express = require('express');
const {
    getEquipments,
    getEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment
} = require('../controllers/equipment');

const Equipment = require('../models/equipment');

// Include other resource routers
// const reservationRouter = require('./reservation'); // Example if equipment has related reservations

// Import middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // Need mergeParams: true to get params from parent router (coworkingSpace)

// // Re-route into other resource routers
// router.use('/:equipmentId/reservations', reservationRouter); // Example

router.route('/')
    .get(advancedResults(Equipment, {
        path: 'coworkingSpace',
        select: 'name description'
    }), getEquipments)
    // POST requires being logged in and being an admin or the owner (Need custom middleware or check in controller)
    // We'll protect it generally first, specific checks might happen in the controller
    .post(protect, addEquipment); // Simplified protection for now

router.route('/:id')
    .get(getEquipment)
    // PUT and DELETE require being logged in and being an admin or the owner
    .put(protect, updateEquipment) // Simplified protection
    .delete(protect, deleteEquipment); // Simplified protection

module.exports = router; 
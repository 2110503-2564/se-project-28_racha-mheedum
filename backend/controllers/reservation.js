const Reservation = require('../models/reservation');
const CoworkingSpace = require('../models/coworkingSpace');

// ✅ Get all reservations (Admin Only)
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('user', 'name email')
            .populate('coworkingSpace');

        res.status(200).json({ success: true, count: reservations.length, data: reservations });
    } catch (error) {
        console.error(`❌ Error in ${req.method} ${req.originalUrl}:`, error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
};

// ✅ Get logged-in user's reservations
exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('coworkingSpace');

        res.status(200).json({ success: true, count: reservations.length, data: reservations });
    } catch (error) {
        console.error(`❌ Error in ${req.method} ${req.originalUrl}:`, error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
};

// ✅ Get a single reservation
exports.getReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('user', 'name email')
            .populate('coworkingSpace');

        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Reservation not found' });
        }

        // Ensure user owns reservation or is an admin
        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        console.error(`❌ Error in ${req.method} ${req.originalUrl}:`, error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
};

// ✅ Create reservation
exports.createReservation = async (req, res) => {
    try {
        req.body.user = req.user._id;

        if (!req.body.coworkingSpace || !req.body.date || !req.body.timeSlot) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields: coworkingSpace, date, and timeSlot' });
        }

        // Check if coworking space exists
        const coworkingSpace = await CoworkingSpace.findById(req.body.coworkingSpace);
        if (!coworkingSpace) {
            return res.status(404).json({ success: false, error: 'Coworking space not found' });
        }

        // Ensure no conflicting reservation exists for the same slot
        const existingReservation = await Reservation.findOne({
            coworkingSpace: req.body.coworkingSpace,
            date: req.body.date,
            timeSlot: req.body.timeSlot
        });

        if (existingReservation) {
            return res.status(400).json({ success: false, error: 'This time slot is already booked' });
        }

        const reservation = await Reservation.create(req.body);

        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error("❌ Error creating reservation:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};


// ✅ Update reservation
exports.updateReservation = async (req, res) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Reservation not found' });
        }

        // Allow update if user owns the reservation or is admin
        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Allow updates to date and timeSlot
        const allowedUpdates = {};
        if (req.body.date) allowedUpdates.date = req.body.date;
        if (req.body.timeSlot) allowedUpdates.timeSlot = req.body.timeSlot;

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ success: false, error: 'Please provide date or timeSlot to update' });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, allowedUpdates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        console.error(`❌ Error in ${req.method} ${req.originalUrl}:`, error);
        res.status(400).json({ success: false, error: error.message });
    }
};


// ✅ Delete reservation
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Reservation not found' });
        }

        // Allow deletion if user owns the reservation or is admin
        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await Reservation.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Reservation deleted successfully" });
    } catch (error) {
        console.error(`❌ Error in ${req.method} ${req.originalUrl}:`, error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
};

///////
exports.getBookedSlots = async (req, res) => {
    try {
        const { coworkingSpace, date } = req.params;

        // Check if coworking space exists
        const existingSpace = await CoworkingSpace.findById(coworkingSpace);
        if (!existingSpace) {
            return res.status(404).json({ success: false, error: "Coworking space not found" });
        }

        // Find all booked time slots and include 'Canceled' status if the reservation is cancelled
        const bookedSlots = await Reservation.find({ coworkingSpace, date })
            .select("timeSlot -_id");

        // Filter out null or canceled slots
        const bookedTimeSlots = bookedSlots.map(slot => slot.timeSlot).filter(Boolean);

        res.status(200).json({
            success: true,
            coworkingSpace,
            date,
            bookedTimeSlots
        });
    } catch (error) {
        console.error("❌ Error fetching booked slots:", error);
        res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
    }
};



exports.cancelReservation = async (req, res) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Reservation not found' });
        }

        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (reservation.status === 'cancelled') {
            return res.status(400).json({ success: false, error: 'This reservation is already cancelled' });
        }

        // Update the status to 'cancelled' and set timeSlot to 'Canceled - [reservation_id]'
        reservation.status = 'cancelled';
        reservation.timeSlot = `Canceled - ${reservation._id}`;  // Add booking ID and status
        await reservation.save();

        res.status(200).json({
            success: true,
            message: "Reservation cancelled and time slot cleared successfully",
            data: reservation
        });
    } catch (error) {
        console.error("❌ Error cancelling reservation:", error);
        res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
    }
};


exports.createCoworkingSpace = async (req, res) => {
    try {
        const { name, address, telephoneNumber, openTime, closeTime, coordinates } = req.body;

        if (!name || !address || !telephoneNumber || !openTime || !closeTime || !coordinates) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide all required fields: name, address, telephoneNumber, openTime, closeTime, coordinates.' 
            });
        }

        // Validate coordinates (latitude, longitude)
        if (!Array.isArray(coordinates) || coordinates.length !== 2 || 
            typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
            return res.status(400).json({ 
                success: false, 
                error: 'Coordinates must be an array with [longitude, latitude].' 
            });
        }

        const coworkingSpace = await CoworkingSpace.create({
            name,
            address,
            telephoneNumber,
            openTime,
            closeTime,
            coordinates: { type: 'Point', coordinates }
        });

        res.status(201).json({
            success: true,
            data: coworkingSpace
        });
    } catch (error) {
        console.error('Error creating coworking space:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};


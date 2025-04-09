const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coworkingSpace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoworkingSpace',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a date for the reservation']
    },
    timeSlot: {
        type: String, // ✅ Added timeSlot
        required: [true, 'Please add a time slot for the reservation']
    },
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ Prevent user from submitting more than 3 active reservations
ReservationSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('status')) {
        const activeReservations = await this.constructor.countDocuments({
            user: this.user,
            status: 'active',
            _id: { $ne: this._id } // Exclude the current reservation
        });

        if (activeReservations >= 3 && this.status === 'active') {
            throw new Error('User cannot have more than 3 active reservations');
        }
    }
    next();
});

module.exports = mongoose.model('Reservation', ReservationSchema);

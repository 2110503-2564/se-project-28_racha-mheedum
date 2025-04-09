const mongoose = require('mongoose');

const CoworkingSpaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    availableSeats: {
        type: Number,
        required: [true, 'Please specify the available seats']
    },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
}, {
    timestamps: true
});

// Add geospatial index to coordinates field
CoworkingSpaceSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('CoworkingSpace', CoworkingSpaceSchema);  // Changed to singular

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        length: 10
    },
    pin: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('pin')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.pin = await bcrypt.hash(this.pin, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare PIN
userSchema.methods.comparePin = async function(candidatePin) {
    return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('User', userSchema);

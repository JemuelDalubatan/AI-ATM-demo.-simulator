const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: ['Virtual Withdrawal', 'Virtual Deposit', 'Digital Transfer Out', 'Digital Transfer In']
    },
    amount: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    toAccount: {
        type: String,
        ref: 'User'
    },
    fromAccount: {
        type: String,
        ref: 'User'
    },
    anomalyScore: {
        type: Number,
        default: 0
    },
    aiVerified: {
        type: Boolean,
        default: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
transactionSchema.index({ accountNumber: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

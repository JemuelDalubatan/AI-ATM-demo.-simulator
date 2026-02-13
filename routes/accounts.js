const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/accounts/balance
// @desc    Get account balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
    try {
        const user = await User.findOne({ accountNumber: req.user.accountNumber }).select('-pin');
        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({
            accountNumber: user.accountNumber,
            name: user.name,
            balance: user.balance
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/accounts/change-pin
// @desc    Change account PIN
// @access  Private
router.put('/change-pin', auth, async (req, res) => {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
        return res.status(400).json({ error: 'Please provide current and new PIN' });
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        return res.status(400).json({ error: 'PIN must be 4 digits' });
    }

    try {
        const user = await User.findOne({ accountNumber: req.user.accountNumber });
        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Verify current PIN
        const isMatch = await user.comparePin(currentPin);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current PIN is incorrect' });
        }

        // Update PIN
        user.pin = newPin;
        await user.save();

        res.json({ message: 'PIN changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

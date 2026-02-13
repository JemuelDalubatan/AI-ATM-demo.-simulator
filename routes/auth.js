const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
    body('pin').isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { accountNumber, pin } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ accountNumber });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(403).json({ error: 'Account is locked. Please contact support.' });
        }

        // Verify PIN
        const isMatch = await user.comparePin(pin);
        if (!isMatch) {
            user.failedLoginAttempts += 1;
            
            // Lock account after 3 failed attempts
            if (user.failedLoginAttempts >= 3) {
                user.isLocked = true;
            }
            
            await user.save();
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.lastLogin = new Date();
        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                accountNumber: user.accountNumber,
                name: user.name
            }
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        accountNumber: user.accountNumber,
                        name: user.name,
                        balance: user.balance
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

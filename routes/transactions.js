const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @route   GET /api/transactions
// @desc    Get transaction history
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ accountNumber: req.user.accountNumber })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/transactions/withdraw
// @desc    Withdraw money
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
    const { amount, currency = 'USD', anomalyScore = 0 } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount > 1000) {
        return res.status(400).json({ error: 'Maximum withdrawal is $1,000' });
    }

    try {
        const user = await User.findOne({ accountNumber: req.user.accountNumber });
        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Update balance
        user.balance -= amount;
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
            accountNumber: user.accountNumber,
            type: 'Virtual Withdrawal',
            amount: -amount,
            balance: user.balance,
            anomalyScore,
            aiVerified: anomalyScore < 30,
            currency
        });
        await transaction.save();

        res.json({
            message: 'Withdrawal successful',
            balance: user.balance,
            transaction
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/transactions/deposit
// @desc    Deposit money
// @access  Private
router.post('/deposit', auth, async (req, res) => {
    const { amount, currency = 'USD', anomalyScore = 0 } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount > 10000) {
        return res.status(400).json({ error: 'Maximum deposit is $10,000' });
    }

    try {
        const user = await User.findOne({ accountNumber: req.user.accountNumber });
        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Update balance
        user.balance += amount;
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
            accountNumber: user.accountNumber,
            type: 'Virtual Deposit',
            amount: amount,
            balance: user.balance,
            anomalyScore,
            aiVerified: anomalyScore < 30,
            currency
        });
        await transaction.save();

        res.json({
            message: 'Deposit successful',
            balance: user.balance,
            transaction
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/transactions/transfer
// @desc    Transfer money to another account
// @access  Private
router.post('/transfer', auth, async (req, res) => {
    const { toAccount, amount, anomalyScore = 0 } = req.body;

    if (!toAccount || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer details' });
    }

    if (toAccount === req.user.accountNumber) {
        return res.status(400).json({ error: 'Cannot transfer to same account' });
    }

    try {
        const fromUser = await User.findOne({ accountNumber: req.user.accountNumber });
        const toUser = await User.findOne({ accountNumber: toAccount });

        if (!fromUser || !toUser) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (fromUser.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Update balances
        fromUser.balance -= amount;
        toUser.balance += amount;

        await fromUser.save();
        await toUser.save();

        // Create transaction records
        const outTransaction = new Transaction({
            accountNumber: fromUser.accountNumber,
            type: 'Digital Transfer Out',
            amount: -amount,
            balance: fromUser.balance,
            toAccount: toUser.accountNumber,
            anomalyScore,
            aiVerified: anomalyScore < 30
        });

        const inTransaction = new Transaction({
            accountNumber: toUser.accountNumber,
            type: 'Digital Transfer In',
            amount: amount,
            balance: toUser.balance,
            fromAccount: fromUser.accountNumber,
            anomalyScore,
            aiVerified: anomalyScore < 30
        });

        await outTransaction.save();
        await inTransaction.save();

        res.json({
            message: 'Transfer successful',
            balance: fromUser.balance,
            transaction: outTransaction
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

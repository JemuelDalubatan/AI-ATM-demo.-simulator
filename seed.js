const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securebank-atm';

const demoAccounts = [
    {
        accountNumber: '1234567890',
        pin: '1234',
        name: 'John Doe',
        balance: 5000
    },
    {
        accountNumber: '9876543210',
        pin: '5678',
        name: 'Jane Smith',
        balance: 10000
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create demo accounts
        for (const account of demoAccounts) {
            const user = new User(account);
            await user.save();
            console.log(`✅ Created account: ${account.accountNumber} (${account.name})`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nDemo Accounts:');
        console.log('Account: 1234567890 | PIN: 1234 | Balance: $5,000');
        console.log('Account: 9876543210 | PIN: 5678 | Balance: $10,000');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

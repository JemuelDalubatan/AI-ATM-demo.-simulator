#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all prerequisites are installed and configured
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 SecureBank ATM - Setup Verification\n');
console.log('=' .repeat(50));

let allGood = true;

// Check Node.js
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    console.log('✅ Node.js:', nodeVersion);
} catch (error) {
    console.log('❌ Node.js: Not installed');
    allGood = false;
}

// Check npm
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    console.log('✅ npm:', npmVersion);
} catch (error) {
    console.log('❌ npm: Not installed');
    allGood = false;
}

// Check MongoDB
try {
    const mongoVersion = execSync('mongod --version', { encoding: 'utf-8' });
    const versionMatch = mongoVersion.match(/v(\d+\.\d+\.\d+)/);
    if (versionMatch) {
        console.log('✅ MongoDB:', versionMatch[1]);
    } else {
        console.log('✅ MongoDB: Installed');
    }
} catch (error) {
    console.log('❌ MongoDB: Not installed or not in PATH');
    allGood = false;
}

// Check if MongoDB is running
try {
    execSync('mongosh --eval "db.version()" --quiet', { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ MongoDB: Running');
} catch (error) {
    console.log('⚠️  MongoDB: Not running (start with: mongod or brew services start mongodb-community)');
}

console.log('\n' + '='.repeat(50));
console.log('📁 Checking Project Files\n');

// Check required files
const requiredFiles = [
    'server.js',
    'package.json',
    '.env',
    'seed.js',
    'models/User.js',
    'models/Transaction.js',
    'routes/auth.js',
    'routes/accounts.js',
    'routes/transactions.js',
    'middleware/auth.js'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}: Missing`);
        allGood = false;
    }
});

// Check node_modules
console.log('\n' + '='.repeat(50));
console.log('📦 Checking Dependencies\n');

if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('✅ node_modules: Installed');
    
    // Check key dependencies
    const keyDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken'];
    keyDeps.forEach(dep => {
        if (fs.existsSync(path.join(__dirname, 'node_modules', dep))) {
            console.log(`  ✅ ${dep}`);
        } else {
            console.log(`  ❌ ${dep}: Missing`);
            allGood = false;
        }
    });
} else {
    console.log('❌ node_modules: Not installed (run: npm install)');
    allGood = false;
}

// Check .env configuration
console.log('\n' + '='.repeat(50));
console.log('⚙️  Checking Configuration\n');

if (fs.existsSync(path.join(__dirname, '.env'))) {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    
    if (envContent.includes('PORT=')) {
        console.log('✅ PORT configured');
    } else {
        console.log('⚠️  PORT not configured');
    }
    
    if (envContent.includes('MONGODB_URI=')) {
        console.log('✅ MONGODB_URI configured');
    } else {
        console.log('⚠️  MONGODB_URI not configured');
    }
    
    if (envContent.includes('JWT_SECRET=')) {
        if (envContent.includes('your_jwt_secret_key_change_this_in_production')) {
            console.log('⚠️  JWT_SECRET: Using default (change for production!)');
        } else {
            console.log('✅ JWT_SECRET configured');
        }
    } else {
        console.log('⚠️  JWT_SECRET not configured');
    }
} else {
    console.log('❌ .env file: Missing');
    allGood = false;
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('📋 Summary\n');

if (allGood) {
    console.log('✅ All checks passed! You\'re ready to go!\n');
    console.log('Next steps:');
    console.log('1. Start MongoDB (if not running)');
    console.log('2. Run: npm run seed');
    console.log('3. Run: npm run dev');
    console.log('4. Open index.html in your browser\n');
} else {
    console.log('❌ Some checks failed. Please fix the issues above.\n');
    console.log('Quick fixes:');
    console.log('- Install Node.js: https://nodejs.org/');
    console.log('- Install MongoDB: https://www.mongodb.com/try/download/community');
    console.log('- Run: npm install');
    console.log('- Check SETUP_GUIDE.md for detailed instructions\n');
}

console.log('=' .repeat(50));

# 🚀 Quick Setup Guide - SecureBank Virtual ATM

## Step-by-Step Installation

### 1. Install Prerequisites

#### Install Node.js
- Download from: https://nodejs.org/
- Recommended: LTS version (v18 or higher)
- Verify installation:
```bash
node --version
npm --version
```

#### Install MongoDB
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow official MongoDB installation guide

### 2. Clone/Download Project
```bash
# If using git
git clone <repository-url>
cd securebank-atm

# Or download and extract ZIP file
```

### 3. Install Dependencies
```bash
npm install
```

This will install:
- express (web server)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors, helmet, morgan (security & logging)
- express-validator, express-rate-limit

### 4. Start MongoDB

#### Windows
```bash
# Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod
```

#### macOS
```bash
brew services start mongodb-community
```

#### Linux
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Auto-start on boot
```

Verify MongoDB is running:
```bash
mongosh
# Should connect to MongoDB shell
```

### 5. Configure Environment

The `.env` file is already created with default values:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/securebank-atm
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a random string for security!

### 6. Seed Database
```bash
npm run seed
```

This creates two demo accounts:
- Account: 1234567890 | PIN: 1234 | Balance: $5,000
- Account: 9876543210 | PIN: 5678 | Balance: $10,000

### 7. Start Backend Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 3000
📡 API available at http://localhost:3000/api
```

### 8. Test the API

Open a new terminal and test:
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"1234567890","pin":"1234"}'
```

### 9. Use Frontend

Open `index.html` in your browser to use the client-side interface.

**Note**: The current frontend uses localStorage. Angular integration coming soon!

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongosh

# If not, start it
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change PORT in `.env` or kill the process using port 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
npm install
```

### Seed Script Fails
```
Error: User validation failed
```
**Solution**: Clear database and try again
```bash
mongosh
use securebank-atm
db.users.deleteMany({})
exit
npm run seed
```

## 📝 Development Workflow

### Making Changes

1. **Backend Changes**: Server auto-restarts with `npm run dev`
2. **Frontend Changes**: Refresh browser
3. **Database Changes**: Re-run seed script if needed

### Testing API Endpoints

Use Postman, Insomnia, or curl:

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"1234567890","pin":"1234"}'
```

#### Get Balance (requires token)
```bash
curl http://localhost:3000/api/accounts/balance \
  -H "x-auth-token: YOUR_JWT_TOKEN"
```

#### Withdraw
```bash
curl -X POST http://localhost:3000/api/transactions/withdraw \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_JWT_TOKEN" \
  -d '{"amount":100}'
```

## 🎯 Next Steps

1. ✅ Backend API is ready
2. ✅ Frontend works with localStorage
3. 🚧 Create Angular frontend
4. 🚧 Connect Angular to Express API
5. 🚧 Deploy to cloud (Heroku, AWS, Azure)

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/introduction)
- [Angular Documentation](https://angular.io/docs)

## 🆘 Need Help?

Check the main README.md for:
- API endpoint details
- Architecture overview
- Security features
- AI capabilities

---

**Happy Coding! 🚀**

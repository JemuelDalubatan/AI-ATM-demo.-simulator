# 🏦 SecureBank Virtual ATM - AI-Powered Digital Banking System (MEAN Stack)

An advanced full-stack virtual ATM system built with MEAN Stack (MongoDB, Express.js, Angular, Node.js) featuring integrated AI security, behavioral biometrics, fraud detection, and real-time currency conversion.

## 🌐 What is a Virtual ATM Web Application?

This is a **digital banking simulation** that replicates ATM functionality through a web interface:

- **No Physical Cash**: All transactions are digital - balances update in the system ledger
- **Virtual Transactions**: Withdrawals and deposits are simulated database updates
- **Real Banking Logic**: Follows actual banking rules and security protocols
- **AI-Enhanced**: Includes intelligent features not found in physical ATMs

### How It Works
1. **User Authentication**: Login with account number + PIN (like inserting a card)
2. **Virtual Operations**: Select withdraw, deposit, transfer, or balance inquiry
3. **Digital Updates**: System updates virtual balances in localStorage (simulates database)
4. **AI Integration**: Real-time fraud detection, currency conversion, and financial insights
5. **No Physical Cash**: Everything is ledger-based - perfect for web banking portals

## 🤖 AI Features

### 1. **Behavioral Biometrics** (BioCatch-inspired)
- **Typing Pattern Analysis**: Tracks keystroke dynamics, timing, and rhythm
- **Mouse Movement Tracking**: Analyzes mouse velocity, smoothness, and patterns
- **Touch Gesture Recognition**: Monitors touch interactions on mobile devices
- **Real-time Risk Scoring**: Calculates behavioral risk score (0-100)
- **Anomaly Detection**: Identifies unusual user behavior patterns

### 2. **AI Fraud Detection** (Azure AI Anomaly Detector-inspired)
- **Transaction Pattern Analysis**: Detects unusual transaction amounts
- **Time-based Anomaly Detection**: Flags transactions at unusual hours
- **Frequency Monitoring**: Identifies suspicious transaction frequency
- **Location Analysis**: Simulated location-based fraud detection
- **Risk Scoring**: Multi-factor risk assessment (0-100 scale)
- **Smart Alerts**: Real-time notifications for suspicious activities

### 3. **AI Financial Assistant**
- **Spending Analysis**: Tracks and analyzes spending patterns
- **Balance Alerts**: Proactive low balance warnings
- **Predictive Analytics**: Forecasts future spending based on history
- **Investment Suggestions**: AI-powered financial recommendations
- **Personalized Insights**: Custom financial advice based on user behavior

### 4. **Security Features**
- **Multi-layer Authentication**: PIN + Behavioral verification
- **Session Monitoring**: Auto-logout after 2 minutes of inactivity
- **Real-time Risk Assessment**: Continuous behavioral analysis
- **Transaction Verification**: AI-powered approval system
- **Fraud Prevention**: Blocks high-risk transactions automatically

## 🎯 Key Features

### Banking Operations
- ✅ Secure PIN-based login
- 💰 Balance inquiry
- 💳 Virtual cash withdrawal (digital balance update)
- 💸 Virtual cash deposit (digital balance update)
- 🔄 Digital account-to-account transfers
- 📊 Transaction history with AI verification badges
- 📄 Receipt generation and download
- 🔐 PIN change functionality
- 💱 Real-time currency conversion with AI recommendations

### AI Security Dashboard
- 🎯 Real-time behavioral analysis
- 📈 Risk score visualization
- 🔍 Detailed security insights
- 📊 Typing and mouse behavior metrics
- 🛡️ Security recommendations

### User Experience
- 🎨 Modern gradient UI design
- 📱 Fully responsive (desktop & mobile)
- 🔔 Toast notifications for all actions
- 💾 Data persistence (localStorage)
- ⚡ Smooth animations and transitions
- 🌐 Cross-browser compatible

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/securebank-atm
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

3. **Start MongoDB**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

4. **Seed Database with Demo Accounts**
```bash
npm run seed
```

5. **Start Backend Server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run at `http://localhost:3000`

### Frontend Setup (Current HTML Version)

For now, the frontend is a standalone HTML application. Simply open `index.html` in your browser to use the client-side version with localStorage.

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with account number and PIN

#### Accounts
- `GET /api/accounts/balance` - Get account balance (requires auth)
- `PUT /api/accounts/change-pin` - Change PIN (requires auth)

#### Transactions
- `GET /api/transactions` - Get transaction history (requires auth)
- `POST /api/transactions/withdraw` - Withdraw money (requires auth)
- `POST /api/transactions/deposit` - Deposit money (requires auth)
- `POST /api/transactions/transfer` - Transfer money (requires auth)

### Demo Accounts
```
Account 1:
- Account Number: 1234567890
- PIN: 1234
- Balance: $5,000

Account 2:
- Account Number: 9876543210
- PIN: 5678
- Balance: $10,000
```

### Installation
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. No server or dependencies required!

### Files Structure
```
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment variables
├── seed.js               # Database seeding script
├── models/
│   ├── User.js           # User/Account model
│   └── Transaction.js    # Transaction model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── accounts.js       # Account management routes
│   └── transactions.js   # Transaction routes
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── index.html            # Frontend HTML
├── style.css             # Styling and animations
├── script.js             # Core banking logic
├── ai-security.js        # AI security & biometrics
├── ai-currency.js        # Currency conversion & market intelligence
└── README.md             # Documentation
```

## 🏗️ MEAN Stack Architecture

### MongoDB
- User accounts with encrypted PINs
- Transaction history with AI verification
- Indexes for optimized queries
- Automatic timestamps

### Express.js
- RESTful API design
- JWT authentication
- Rate limiting
- Security headers (Helmet)
- CORS enabled
- Request validation

### Angular (Coming Soon)
- Component-based architecture
- Reactive forms
- HTTP interceptors for auth
- State management
- Lazy loading

### Node.js
- Async/await patterns
- Error handling middleware
- Environment configuration
- Bcrypt password hashing
- JWT token generation

## 🔬 AI Technology Stack

### Behavioral Biometrics
- **Typing Dynamics**: Keystroke timing and duration analysis
- **Mouse Dynamics**: Movement velocity and smoothness tracking
- **Touch Analytics**: Gesture pattern recognition
- **Session Profiling**: User interaction timing analysis

### Anomaly Detection Algorithms
- **Statistical Analysis**: Mean, variance, and deviation detection
- **Pattern Recognition**: Historical behavior comparison
- **Multi-factor Scoring**: Weighted risk assessment
- **Threshold-based Alerts**: Configurable risk levels

### Machine Learning Concepts
- **Behavioral Profiling**: User pattern learning
- **Predictive Analytics**: Spending forecasting
- **Risk Classification**: Low/Medium/High risk categorization
- **Adaptive Learning**: Pattern updates based on user behavior

## 🛡️ Security Measures

### Authentication
- Hashed PIN storage (demo implementation)
- Behavioral verification on login
- Failed attempt tracking
- Account lockout mechanism

### Transaction Security
- Real-time fraud detection
- Anomaly scoring for all transactions
- User confirmation for high-risk operations
- Transaction limits enforcement

### Session Security
- Auto-logout after inactivity
- Session timeout warnings
- Secure data clearing on logout
- Continuous behavioral monitoring

## 📊 AI Risk Scoring

### Risk Levels
- **LOW (0-20)**: Normal behavior, transaction approved
- **MEDIUM (21-60)**: Unusual pattern, additional monitoring
- **HIGH (61-100)**: Suspicious activity, requires verification

### Scoring Factors
1. **Amount Anomaly** (40% weight)
   - Compared to average transaction amount
   - Maximum transaction history
   
2. **Time Anomaly** (20% weight)
   - Unusual transaction hours
   - Pattern deviation from normal times
   
3. **Frequency Anomaly** (30% weight)
   - Transaction count per hour
   - Rapid successive transactions
   
4. **Behavioral Anomaly** (10% weight)
   - Typing pattern changes
   - Mouse behavior deviation

## 🎨 UI/UX Features

### Visual Feedback
- Color-coded risk indicators
- Animated transitions
- Real-time notifications
- Progress indicators
- Status badges

### Accessibility
- Clear visual hierarchy
- Touch-friendly buttons
- Keyboard navigation support
- Responsive design
- High contrast colors

## 🔮 Future Enhancements

### Potential Integrations
- **Azure AI Anomaly Detector**: Cloud-based anomaly detection
- **TypingDNA**: Advanced typing biometrics API
- **BioCatch**: Professional behavioral biometrics
- **Amazon Rekognition**: Facial recognition authentication
- **Google Vertex AI**: Advanced predictive analytics
- **Azure Cognitive Services**: Multilingual voice assistant

### Planned Features
- Voice commands
- Facial recognition login
- Multi-language support
- Advanced analytics dashboard
- Export transaction reports
- Budget planning tools
- Savings goal tracking

## 📝 Technical Notes

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Storage
- **Backend**: MongoDB database for persistent storage
- **Frontend**: localStorage for client-side caching (current version)
- **Security**: Bcrypt hashed PINs, JWT tokens
- **Transactions**: Full audit trail with timestamps
- **Scalability**: Ready for cloud deployment

### Performance
- Lightweight (no external dependencies)
- Fast load times
- Efficient DOM manipulation
- Optimized event listeners

## 🤝 Contributing

This is a demonstration project showcasing AI integration in banking applications. Feel free to:
- Fork and modify
- Add new AI features
- Improve security measures
- Enhance UI/UX
- Report issues

## ⚠️ Disclaimer

This project demonstrates MEAN Stack architecture with AI features for educational purposes.

**Current Status:**
- ✅ Backend API (Express + MongoDB) - Complete
- ✅ Frontend (HTML/CSS/JS) - Complete with localStorage
- 🚧 Angular Frontend - Coming soon
- 🚧 Frontend-Backend Integration - Coming soon

**Security Notes:**
- Backend uses bcrypt for PIN hashing
- JWT tokens for authentication
- Rate limiting and security headers
- Ready for production with proper configuration

**For Production Use:**
- Change JWT_SECRET in .env
- Use strong MongoDB credentials
- Enable HTTPS/SSL
- Implement additional security layers
- Add input sanitization
- Set up monitoring and logging
- Follow banking compliance regulations

## 📄 License

MIT License - Free to use and modify

## 🌟 Credits

Inspired by modern banking security practices and AI technologies:
- BioCatch behavioral biometrics
- Azure AI Anomaly Detector
- TypingDNA keystroke dynamics
- IBM Safer Payments
- Amazon Fraud Detector

---

**Built with ❤️ for educational purposes**

*Demonstrating the future of secure, AI-powered banking*

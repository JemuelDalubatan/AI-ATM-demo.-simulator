// AI Security & Behavioral Biometrics Module

class BehavioralBiometrics {
    constructor() {
        this.userProfile = {
            typingPattern: [],
            mouseMovements: [],
            touchGestures: [],
            interactionTiming: [],
            loginTimes: []
        };
        this.currentSession = {
            keystrokes: [],
            mouseData: [],
            startTime: Date.now(),
            pasteDetected: false,
            pasteCount: 0
        };
        this.loginSession = {
            pasteDetected: false,
            pasteCount: 0
        };
        this.riskScore = 0;
        this.initializeTracking();
    }

    initializeTracking() {
        // Track typing patterns
        document.addEventListener('keydown', (e) => this.trackKeystroke(e));
        document.addEventListener('keyup', (e) => this.trackKeyRelease(e));
        
        // Track paste events (suspicious behavior) - only on login inputs
        document.addEventListener('paste', (e) => {
            // Only track paste on login screen
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen && activeScreen.id === 'loginScreen') {
                this.trackPaste(e);
            }
        });
        
        // Track mouse movements
        document.addEventListener('mousemove', (e) => this.trackMouseMovement(e));
        document.addEventListener('click', (e) => this.trackClick(e));
        
        // Track touch gestures
        document.addEventListener('touchstart', (e) => this.trackTouch(e));
        document.addEventListener('touchmove', (e) => this.trackTouchMove(e));
    }

    trackPaste(e) {
        // Pasting is considered suspicious behavior
        this.currentSession.pasteDetected = true;
        this.currentSession.pasteCount = (this.currentSession.pasteCount || 0) + 1;
        this.loginSession.pasteDetected = true;
        this.loginSession.pasteCount = (this.loginSession.pasteCount || 0) + 1;
        
        console.log('⚠️ PASTE DETECTED - Suspicious behavior! Count:', this.currentSession.pasteCount);
        console.log('Current session state:', this.currentSession);
    }

    trackKeystroke(e) {
        const timestamp = Date.now();
        this.currentSession.keystrokes.push({
            key: e.key,
            timestamp: timestamp,
            duration: 0
        });
    }

    trackKeyRelease(e) {
        const lastKeystroke = this.currentSession.keystrokes[this.currentSession.keystrokes.length - 1];
        if (lastKeystroke && lastKeystroke.key === e.key) {
            lastKeystroke.duration = Date.now() - lastKeystroke.timestamp;
        }
    }

    trackMouseMovement(e) {
        const timestamp = Date.now();
        this.currentSession.mouseData.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: timestamp,
            velocity: this.calculateVelocity(e)
        });
        
        // Keep only last 50 movements for performance
        if (this.currentSession.mouseData.length > 50) {
            this.currentSession.mouseData.shift();
        }
    }

    trackClick(e) {
        this.currentSession.mouseData.push({
            type: 'click',
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });
    }

    trackTouch(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.currentSession.mouseData.push({
                type: 'touch',
                x: touch.clientX,
                y: touch.clientY,
                timestamp: Date.now()
            });
        }
    }

    trackTouchMove(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.trackMouseMovement({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    calculateVelocity(e) {
        const lastMove = this.currentSession.mouseData[this.currentSession.mouseData.length - 1];
        if (!lastMove || lastMove.type === 'click') return 0;
        
        const dx = e.clientX - lastMove.x;
        const dy = e.clientY - lastMove.y;
        const dt = Date.now() - lastMove.timestamp;
        
        return Math.sqrt(dx * dx + dy * dy) / (dt || 1);
    }

    analyzeTypingPattern() {
        const keystrokes = this.currentSession.keystrokes.filter(k => k.duration > 0);
        
        // Check for paste behavior (very suspicious) - check both current and login session
        const pasteDetected = this.currentSession.pasteDetected || this.loginSession.pasteDetected;
        
        if (pasteDetected) {
            console.log('🚨 PASTE BEHAVIOR CONFIRMED IN ANALYSIS');
            return {
                avgDuration: 0,
                variance: 0,
                isConsistent: false,
                pasteDetected: true,
                score: 10, // Very low score for pasting
                confidence: 'high'
            };
        }
        
        if (keystrokes.length < 3) {
            console.log('⚠️ Not enough keystrokes for analysis:', keystrokes.length);
            return { score: 50, confidence: 'low', pasteDetected: false };
        }
        
        const avgDuration = keystrokes.reduce((sum, k) => sum + k.duration, 0) / keystrokes.length;
        const variance = keystrokes.reduce((sum, k) => sum + Math.pow(k.duration - avgDuration, 2), 0) / keystrokes.length;
        
        // Compare with user profile if exists
        const isConsistent = variance < 5000; // Lower variance = more consistent
        
        console.log('✅ Typing analysis complete:', { avgDuration, variance, isConsistent });
        
        return {
            avgDuration,
            variance,
            isConsistent,
            pasteDetected: false,
            score: isConsistent ? 100 : 60,
            confidence: isConsistent ? 'high' : 'medium'
        };
    }

    analyzeMouseBehavior() {
        const mouseData = this.currentSession.mouseData.filter(m => m.velocity !== undefined);
        if (mouseData.length < 10) return { score: 0, confidence: 'low' };
        
        const avgVelocity = mouseData.reduce((sum, m) => sum + m.velocity, 0) / mouseData.length;
        const smoothness = this.calculateSmoothness(mouseData);
        
        // Human-like behavior: moderate velocity, smooth movements
        const isHumanLike = avgVelocity > 0.1 && avgVelocity < 5 && smoothness > 0.5;
        
        return {
            avgVelocity,
            smoothness,
            isHumanLike,
            score: isHumanLike ? 100 : 50,
            confidence: isHumanLike ? 'high' : 'medium'
        };
    }

    calculateSmoothness(mouseData) {
        if (mouseData.length < 2) return 0;
        
        let smoothScore = 0;
        for (let i = 1; i < mouseData.length; i++) {
            const velocityChange = Math.abs(mouseData[i].velocity - mouseData[i-1].velocity);
            smoothScore += velocityChange < 2 ? 1 : 0;
        }
        
        return smoothScore / (mouseData.length - 1);
    }

    calculateRiskScore() {
        const typingAnalysis = this.analyzeTypingPattern();
        const mouseAnalysis = this.analyzeMouseBehavior();
        
        // Combine scores (weighted average)
        const combinedScore = (typingAnalysis.score * 0.4 + mouseAnalysis.score * 0.6);
        this.riskScore = 100 - combinedScore; // Higher risk = lower behavioral match
        
        return {
            riskScore: this.riskScore,
            riskLevel: this.getRiskLevel(this.riskScore),
            typingAnalysis,
            mouseAnalysis,
            recommendation: this.getRecommendation(this.riskScore)
        };
    }

    getRiskLevel(score) {
        if (score < 20) return 'LOW';
        if (score < 50) return 'MEDIUM';
        return 'HIGH';
    }

    getRecommendation(score) {
        if (score < 20) return 'Transaction approved - Normal behavior detected';
        if (score < 50) return 'Additional verification recommended';
        return 'High risk detected - Transaction blocked for security';
    }

    reset() {
        // Reset current session but DON'T preserve paste detection from loginSession
        this.currentSession = {
            keystrokes: [],
            mouseData: [],
            startTime: Date.now(),
            pasteDetected: false,
            pasteCount: 0
        };
        console.log('Session reset - fresh start');
    }
    
    resetLoginSession() {
        // Only call this on logout - fully reset everything
        this.loginSession = {
            pasteDetected: false,
            pasteCount: 0
        };
        this.currentSession = {
            keystrokes: [],
            mouseData: [],
            startTime: Date.now(),
            pasteDetected: false,
            pasteCount: 0
        };
        this.riskScore = 0;
        console.log('🔄 Login session fully reset - all biometrics cleared');
    }
}

// Anomaly Detection for Transactions
class AnomalyDetector {
    constructor() {
        this.transactionHistory = [];
        this.userPatterns = {};
    }

    analyzeTransaction(accountNumber, type, amount, time = new Date()) {
        const hour = time.getHours();
        const dayOfWeek = time.getDay();
        
        // Get user's historical patterns
        const patterns = this.userPatterns[accountNumber] || this.initializePattern();
        
        // Analyze multiple factors
        const amountAnomaly = this.detectAmountAnomaly(amount, patterns.avgAmount, patterns.maxAmount);
        const timeAnomaly = this.detectTimeAnomaly(hour, patterns.commonHours);
        const frequencyAnomaly = this.detectFrequencyAnomaly(accountNumber, time);
        const locationAnomaly = this.detectLocationAnomaly(); // Simulated
        
        // Calculate overall anomaly score
        const anomalyScore = (
            amountAnomaly * 0.4 +
            timeAnomaly * 0.2 +
            frequencyAnomaly * 0.3 +
            locationAnomaly * 0.1
        );
        
        // Update patterns
        this.updatePatterns(accountNumber, type, amount, hour);
        
        return {
            isAnomaly: anomalyScore > 60,
            anomalyScore: Math.round(anomalyScore),
            factors: {
                amount: amountAnomaly,
                time: timeAnomaly,
                frequency: frequencyAnomaly,
                location: locationAnomaly
            },
            recommendation: this.getAnomalyRecommendation(anomalyScore),
            details: this.getAnomalyDetails(anomalyScore, {amountAnomaly, timeAnomaly, frequencyAnomaly})
        };
    }

    initializePattern() {
        return {
            avgAmount: 100,
            maxAmount: 500,
            commonHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
            transactionCount: 0,
            lastTransactionTime: null
        };
    }

    detectAmountAnomaly(amount, avgAmount, maxAmount) {
        if (amount > maxAmount * 2) return 100; // Way above normal
        if (amount > maxAmount * 1.5) return 70;
        if (amount > avgAmount * 3) return 50;
        return 0;
    }

    detectTimeAnomaly(hour, commonHours) {
        // Unusual hours: late night (1-5 AM)
        if (hour >= 1 && hour <= 5) return 80;
        if (!commonHours.includes(hour)) return 40;
        return 0;
    }

    detectFrequencyAnomaly(accountNumber, currentTime) {
        const recentTransactions = this.transactionHistory.filter(t => 
            t.accountNumber === accountNumber &&
            (currentTime - t.time) < 3600000 // Last hour
        );
        
        if (recentTransactions.length > 5) return 90; // Too many transactions
        if (recentTransactions.length > 3) return 60;
        return 0;
    }

    detectLocationAnomaly() {
        // Simulated location check (in real app, would use geolocation)
        return Math.random() * 20; // Random low score for demo
    }

    updatePatterns(accountNumber, type, amount, hour) {
        if (!this.userPatterns[accountNumber]) {
            this.userPatterns[accountNumber] = this.initializePattern();
        }
        
        const pattern = this.userPatterns[accountNumber];
        pattern.transactionCount++;
        pattern.avgAmount = (pattern.avgAmount * (pattern.transactionCount - 1) + amount) / pattern.transactionCount;
        pattern.maxAmount = Math.max(pattern.maxAmount, amount);
        
        if (!pattern.commonHours.includes(hour)) {
            pattern.commonHours.push(hour);
        }
        
        this.transactionHistory.push({
            accountNumber,
            type,
            amount,
            time: new Date()
        });
        
        // Keep only last 100 transactions
        if (this.transactionHistory.length > 100) {
            this.transactionHistory.shift();
        }
    }

    getAnomalyRecommendation(score) {
        if (score < 30) return 'Transaction appears normal';
        if (score < 60) return 'Unusual pattern detected - Proceed with caution';
        return 'High risk transaction - Additional verification required';
    }

    getAnomalyDetails(score, factors) {
        const details = [];
        if (factors.amountAnomaly > 50) details.push('Unusually large amount');
        if (factors.timeAnomaly > 50) details.push('Unusual transaction time');
        if (factors.frequencyAnomaly > 50) details.push('High transaction frequency');
        
        return details.length > 0 ? details.join(', ') : 'Normal transaction pattern';
    }
}

// AI Financial Assistant
class AIFinancialAssistant {
    constructor() {
        this.insights = [];
    }

    generateInsights(account) {
        const insights = [];
        const balance = account.balance;
        const transactions = account.transactions || [];
        
        // Spending analysis
        const last30Days = transactions.filter(t => {
            const daysDiff = (Date.now() - new Date(t.date)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });
        
        const totalSpent = last30Days
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const totalDeposited = last30Days
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Generate insights
        if (balance < 500) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Low Balance Alert',
                message: `Your balance is below $500. Consider depositing funds soon.`
            });
        }
        
        if (totalSpent > totalDeposited && last30Days.length > 0) {
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'Spending Pattern',
                message: `You've spent $${totalSpent.toFixed(2)} more than deposited this month.`
            });
        }
        
        if (balance > 5000) {
            insights.push({
                type: 'success',
                icon: '💡',
                title: 'Investment Opportunity',
                message: `Great balance! Consider investing to grow your wealth.`
            });
        }
        
        // Predict next month spending
        if (last30Days.length > 5) {
            const avgDailySpending = totalSpent / 30;
            const predictedSpending = avgDailySpending * 30;
            
            insights.push({
                type: 'info',
                icon: '🔮',
                title: 'AI Prediction',
                message: `Based on your patterns, you'll likely spend $${predictedSpending.toFixed(2)} next month.`
            });
        }
        
        return insights;
    }

    getSavingsSuggestion(balance, monthlySpending) {
        const suggestedSavings = Math.min(balance * 0.2, 1000);
        return {
            amount: suggestedSavings,
            message: `AI suggests saving $${suggestedSavings.toFixed(2)} this month based on your balance and spending habits.`
        };
    }
}

// Export instances
const biometrics = new BehavioralBiometrics();
const anomalyDetector = new AnomalyDetector();
const aiAssistant = new AIFinancialAssistant();

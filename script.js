// Demo accounts database
const accounts = {
    '1234567890': {
        pin: '1234',
        name: 'John Doe',
        balance: 5000,
        transactions: []
    },
    '9876543210': {
        pin: '5678',
        name: 'Jane Smith',
        balance: 10000,
        transactions: []
    }
};

let currentAccount = null;
let sessionTimeout = null;
let aiEnabled = true;
let displayCurrency = 'USD'; // Default display currency

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    
    // Check if terms were accepted, otherwise show welcome screen
    checkTermsAcceptance();
    
    // Update currency rates every 5 minutes
    setInterval(() => {
        if (currentAccount) {
            updateBalanceDisplay();
        }
    }, 300000);
});

// Load data from localStorage
function loadFromStorage() {
    const saved = localStorage.getItem('atmAccounts');
    if (saved) {
        Object.assign(accounts, JSON.parse(saved));
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('atmAccounts', JSON.stringify(accounts));
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'historyScreen') {
        displayTransactions();
    }
    
    if (screenId === 'mainMenu') {
        resetSessionTimeout();
        updateAIInsights();
    }
    
    if (screenId === 'currencyScreen') {
        displayCurrencyMarket();
    }
    
    if (screenId === 'withdrawScreen') {
        // Initialize withdraw currency selector
        document.getElementById('withdrawCurrency').value = 'USD';
        updateWithdrawCurrency();
    }
    
    if (screenId === 'depositScreen') {
        // Initialize deposit currency selector
        document.getElementById('depositCurrency').value = 'USD';
        updateDepositCurrency();
    }
    
    if (screenId === 'loginScreen') {
        // Reset biometrics when returning to login screen
        if (biometrics && typeof biometrics.resetLoginSession === 'function') {
            biometrics.resetLoginSession();
            console.log('🔄 Biometrics reset on login screen');
        }
    }
}

// Update currency info for transaction screens
function updateCurrencyInfo(type) {
    const selectedCurrency = document.getElementById('displayCurrency')?.value || 'USD';
    const infoBoxId = type === 'withdraw' ? 'withdrawCurrencyInfo' : 'depositCurrencyInfo';
    const infoBox = document.getElementById(infoBoxId);
    
    if (selectedCurrency !== 'USD') {
        const rate = currencyConverter.exchangeRates[selectedCurrency];
        const currencyInfo = currencyConverter.currencies[selectedCurrency];
        infoBox.innerHTML = `
            ${currencyInfo.flag} <strong>Currency Conversion Active</strong><br>
            1 USD = ${rate.toFixed(4)} ${selectedCurrency} | Live rate updated
        `;
        infoBox.style.display = 'block';
    } else {
        infoBox.style.display = 'none';
    }
}

// Update withdraw preview
function updateWithdrawPreview() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const preview = document.getElementById('withdrawPreview');
    const selectedCurrency = document.getElementById('withdrawCurrency').value;
    
    if (amount && amount > 0) {
        if (selectedCurrency === 'USD') {
            preview.innerHTML = `You will withdraw <strong>$${amount.toFixed(2)} USD</strong>`;
            preview.classList.add('show');
        } else {
            const converted = currencyConverter.convert(amount, selectedCurrency, 'USD');
            if (converted) {
                const currencyInfo = currencyConverter.currencies[selectedCurrency];
                preview.innerHTML = `${currencyInfo.symbol}${amount.toFixed(2)} ${selectedCurrency} = <strong>$${converted.amount.toFixed(2)} USD</strong> will be deducted`;
                preview.classList.add('show');
            }
        }
    } else {
        preview.classList.remove('show');
    }
}

// Update deposit preview
function updateDepositPreview() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const preview = document.getElementById('depositPreview');
    const selectedCurrency = document.getElementById('depositCurrency').value;
    
    if (amount && amount > 0) {
        if (selectedCurrency === 'USD') {
            preview.innerHTML = `You will deposit <strong>$${amount.toFixed(2)} USD</strong>`;
            preview.classList.add('show');
        } else {
            const converted = currencyConverter.convert(amount, selectedCurrency, 'USD');
            if (converted) {
                const currencyInfo = currencyConverter.currencies[selectedCurrency];
                preview.innerHTML = `${currencyInfo.symbol}${amount.toFixed(2)} ${selectedCurrency} = <strong>$${converted.amount.toFixed(2)} USD</strong> will be added`;
                preview.classList.add('show');
            }
        }
    } else {
        preview.classList.remove('show');
    }
}

// Currency Market Display
function displayCurrencyMarket() {
    // Check if converter is ready
    if (!currencyConverter || !currencyConverter.marketTrends || currencyConverter.marketTrends.length === 0) {
        const newsContainer = document.getElementById('marketNews');
        const moversContainer = document.getElementById('topMovers');
        
        newsContainer.innerHTML = `
            <h3>📰 Loading Market Data...</h3>
            <p style="text-align: center; padding: 20px; color: #666;">
                Initializing currency exchange rates and market analysis...
            </p>
        `;
        
        moversContainer.innerHTML = `
            <h3>🔥 Loading Top Movers...</h3>
            <p style="text-align: center; padding: 20px; color: #666;">
                Please wait...
            </p>
        `;
        
        // Force initialization and retry
        if (currencyConverter && typeof currencyConverter.useSimulatedRates === 'function') {
            currencyConverter.useSimulatedRates();
        }
        
        setTimeout(displayCurrencyMarket, 500);
        return;
    }
    
    try {
        // Display market news
        const topMovers = currencyConverter.getTopMovers(5);
        const marketSummary = currencyConverter.getMarketSummary();
        
        const newsContainer = document.getElementById('marketNews');
        newsContainer.innerHTML = `
            <h3>📰 Live Market News</h3>
            <div class="market-summary">
                <h4>Market Sentiment: ${marketSummary.sentiment}</h4>
                <div class="market-stats">
                    <div class="market-stat">
                        <span class="stat-value">${marketSummary.upCount}</span>
                        <span class="stat-label">📈 Rising</span>
                    </div>
                    <div class="market-stat">
                        <span class="stat-value">${marketSummary.downCount}</span>
                        <span class="stat-label">📉 Falling</span>
                    </div>
                    <div class="market-stat">
                        <span class="stat-value">${marketSummary.avgChange}%</span>
                        <span class="stat-label">Avg Change</span>
                    </div>
                </div>
            </div>
            ${topMovers.slice(0, 3).map(mover => `
                <div class="news-item">
                    <div class="news-text">${mover.news}</div>
                    <div class="news-badge ${mover.trend}">
                        ${mover.trend === 'up' ? '📈' : '📉'} ${Math.abs(mover.change).toFixed(2)}%
                    </div>
                </div>
            `).join('')}
        `;
        
        // Display top movers
        const moversContainer = document.getElementById('topMovers');
        moversContainer.innerHTML = `
            <h3>🔥 Top Currency Movers</h3>
            ${topMovers.map(mover => {
                const currencyInfo = currencyConverter.currencies[mover.currency];
                return `
                    <div class="mover-item">
                        <div class="mover-info">
                            <div class="mover-flag">${currencyInfo.flag}</div>
                            <div class="mover-details">
                                <h4>${currencyInfo.name} (${mover.currency})</h4>
                                <p>${mover.prediction}</p>
                            </div>
                        </div>
                        <div class="mover-change">
                            <div class="change-value ${mover.change > 0 ? 'positive' : 'negative'}">
                                ${mover.change > 0 ? '+' : ''}${mover.change.toFixed(2)}%
                            </div>
                            <div class="change-icon">${mover.trend === 'up' ? '📈' : '📉'}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    } catch (error) {
        console.error('Error displaying currency market:', error);
        showNotification('Error loading market data. Please try again.', 'error');
    }
}

// Convert Currency
function convertCurrency() {
    const amount = parseFloat(document.getElementById('convertAmount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    if (fromCurrency === toCurrency) {
        showNotification('Please select different currencies', 'error');
        return;
    }
    
    // Check if converter is ready
    if (!currencyConverter || !currencyConverter.exchangeRates || Object.keys(currencyConverter.exchangeRates).length === 0) {
        showNotification('Loading exchange rates... Please wait', 'info');
        setTimeout(convertCurrency, 1000);
        return;
    }
    
    const result = currencyConverter.convert(amount, fromCurrency, toCurrency);
    
    if (!result) {
        showNotification('Conversion failed. Rates not available for selected currencies.', 'error');
        return;
    }
    
    const recommendation = currencyConverter.getExchangeRecommendation(fromCurrency, toCurrency, amount);
    
    const resultContainer = document.getElementById('conversionResult');
    resultContainer.innerHTML = `
        <div class="result-amount">
            ${currencyConverter.formatCurrency(result.amount, toCurrency)}
        </div>
        <div class="result-rate">
            1 ${fromCurrency} = ${result.rate.toFixed(4)} ${toCurrency}
        </div>
        <div class="result-recommendation">
            <strong>🤖 AI Recommendation:</strong><br>
            ${recommendation.recommendation}<br>
            <small>Potential savings: ${currencyConverter.formatCurrency(recommendation.potentialSavings, toCurrency)}</small>
        </div>
    `;
    resultContainer.classList.add('show');
    
    showNotification('✅ Currency converted successfully', 'success');
}

// Swap currencies
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    // Auto-convert if amount is entered
    const amount = document.getElementById('convertAmount').value;
    if (amount && amount > 0) {
        convertCurrency();
    }
}

// AI Dashboard Functions
function toggleAIDashboard() {
    const dashboard = document.getElementById('aiDashboard');
    dashboard.classList.toggle('active');
    
    if (dashboard.classList.contains('active') && currentAccount) {
        updateAISecurityDashboard();
    }
}

function closeAIDashboard() {
    document.getElementById('aiDashboard').classList.remove('active');
}

function updateAISecurityDashboard() {
    const analysis = biometrics.calculateRiskScore();
    
    // Update risk score display
    const scoreElement = document.getElementById('riskScoreValue');
    const circleElement = document.getElementById('riskScoreCircle');
    const levelElement = document.getElementById('riskLevel');
    
    scoreElement.textContent = Math.round(analysis.riskScore);
    levelElement.textContent = `${analysis.riskLevel} RISK - ${analysis.recommendation}`;
    
    // Update circle color based on risk
    circleElement.className = 'score-circle';
    levelElement.className = 'risk-level';
    
    if (analysis.riskLevel === 'LOW') {
        levelElement.classList.add('low');
    } else if (analysis.riskLevel === 'MEDIUM') {
        circleElement.classList.add('medium-risk');
        levelElement.classList.add('medium');
    } else {
        circleElement.classList.add('high-risk');
        levelElement.classList.add('high');
    }
    
    // Display detailed insights
    const insightsContainer = document.getElementById('aiInsights');
    
    let pasteWarning = '';
    if (analysis.typingAnalysis.pasteDetected) {
        pasteWarning = `
            <div class="insight-item" style="border-left-color: #e74c3c;">
                <h5>⚠️ Paste Behavior Detected</h5>
                <p>Copy-paste detected instead of typing - this is suspicious behavior that may indicate credential theft or bot activity.</p>
            </div>
        `;
    }
    
    insightsContainer.innerHTML = `
        ${pasteWarning}
        <div class="insight-item">
            <h5>🎯 Typing Pattern Analysis</h5>
            <p>Confidence: ${analysis.typingAnalysis.confidence} | Score: ${Math.round(analysis.typingAnalysis.score)}/100</p>
            ${analysis.typingAnalysis.pasteDetected ? '<p style="color: #e74c3c; font-weight: 600;">⚠️ Paste detected - High risk</p>' : ''}
        </div>
        <div class="insight-item">
            <h5>🖱️ Mouse Behavior Analysis</h5>
            <p>Confidence: ${analysis.mouseAnalysis.confidence} | Score: ${Math.round(analysis.mouseAnalysis.score)}/100</p>
        </div>
        <div class="insight-item">
            <h5>🔒 Security Recommendation</h5>
            <p>${analysis.recommendation}</p>
        </div>
    `;
}

function updateAIInsights() {
    if (!currentAccount) return;
    
    const account = accounts[currentAccount];
    const insights = aiAssistant.generateInsights(account);
    const container = document.getElementById('aiInsightsCard');
    
    if (insights.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <h4>🤖 AI Financial Insights</h4>
        ${insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="icon">${insight.icon}</div>
                <div class="content">
                    <h5>${insight.title}</h5>
                    <p>${insight.message}</p>
                </div>
            </div>
        `).join('')}
    `;
}

// Session timeout (2 minutes)
function resetSessionTimeout() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    sessionTimeout = setTimeout(() => {
        showNotification('Session expired due to inactivity', 'info');
        setTimeout(logout, 2000);
    }, 120000); // 2 minutes
}

// Custom Security Alert
function showSecurityAlert(title, message, details, onProceed, onCancel) {
    const overlay = document.getElementById('securityAlertOverlay');
    const titleElement = document.getElementById('alertTitle');
    const messageElement = document.getElementById('alertMessage');
    const detailsElement = document.getElementById('alertDetails');
    const proceedBtn = document.getElementById('alertProceedBtn');
    const cancelBtn = document.getElementById('alertCancelBtn');
    
    titleElement.textContent = title;
    messageElement.innerHTML = message;
    detailsElement.innerHTML = details;
    
    overlay.classList.add('active');
    
    // Remove old event listeners
    const newProceedBtn = proceedBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    proceedBtn.parentNode.replaceChild(newProceedBtn, proceedBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners
    document.getElementById('alertProceedBtn').addEventListener('click', () => {
        overlay.classList.remove('active');
        if (onProceed) onProceed();
    });
    
    document.getElementById('alertCancelBtn').addEventListener('click', () => {
        overlay.classList.remove('active');
        if (onCancel) onCancel();
    });
}

// Login
function login() {
    const accountNumber = document.getElementById('accountNumber').value;
    const pin = document.getElementById('pinInput').value;
    
    if (!accountNumber || !pin) {
        showNotification('Please enter account number and PIN', 'error');
        return;
    }
    
    // AI Behavioral Analysis
    const behaviorAnalysis = biometrics.calculateRiskScore();
    
    // Check for paste behavior
    if (behaviorAnalysis.typingAnalysis.pasteDetected) {
        showNotification('⚠️ Paste behavior detected - Security risk identified', 'error');
        
        const message = `
            <p><strong>Paste behavior detected instead of typing.</strong></p>
            <p>This is suspicious and may indicate:</p>
            <p>• Stolen credentials</p>
            <p>• Bot/automated access</p>
            <p>• Security compromise</p>
        `;
        
        const details = `<strong>Risk Score:</strong> ${Math.round(behaviorAnalysis.riskScore)}/100 (HIGH RISK)`;
        
        showSecurityAlert(
            'Suspicious Login Behavior',
            message,
            details,
            () => attemptLogin(accountNumber, pin, behaviorAnalysis), // Proceed
            () => { /* Cancel - do nothing */ } // Cancel
        );
        return;
    }
    
    if (accounts[accountNumber] && accounts[accountNumber].pin === pin) {
        // Check behavioral risk
        if (behaviorAnalysis.riskScore > 70) {
            const message = `
                <p><strong>Unusual login behavior detected.</strong></p>
                <p>Your interaction patterns differ from normal behavior.</p>
            `;
            
            const details = `<strong>Risk Score:</strong> ${Math.round(behaviorAnalysis.riskScore)}/100`;
            
            showSecurityAlert(
                'Unusual Behavior Detected',
                message,
                details,
                () => completeLogin(accountNumber), // Proceed
                () => { /* Cancel - do nothing */ } // Cancel
            );
        } else {
            completeLogin(accountNumber);
        }
    } else {
        showNotification('Invalid account number or PIN', 'error');
    }
}

function attemptLogin(accountNumber, pin, behaviorAnalysis) {
    if (accounts[accountNumber] && accounts[accountNumber].pin === pin) {
        completeLogin(accountNumber);
    } else {
        showNotification('Invalid account number or PIN', 'error');
    }
}

function completeLogin(accountNumber) {
    currentAccount = accountNumber;
    document.getElementById('userName').textContent = accounts[accountNumber].name;
    document.getElementById('userAccount').textContent = accountNumber;
    updateBalanceDisplay();
    showScreen('mainMenu');
    showNotification('✅ Login successful! AI Security Active', 'success');
    resetSessionTimeout();
    // Don't reset biometrics here - keep paste detection data
    console.log('Login complete - biometrics preserved');
    
    // Clear inputs
    document.getElementById('accountNumber').value = '';
    document.getElementById('pinInput').value = '';
}

// Logout
function logout() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    currentAccount = null;
    
    // Fully reset all biometrics data
    biometrics.resetLoginSession();
    
    // Close AI dashboard if open
    document.getElementById('aiDashboard').classList.remove('active');
    
    showScreen('loginScreen');
    showNotification('Logged out successfully - Security session cleared', 'info');
    
    console.log('🔓 Logout complete - All biometrics data cleared');
}

// Update balance display
function updateBalanceDisplay() {
    if (!currentAccount || !accounts[currentAccount]) return;
    
    const balance = accounts[currentAccount].balance;
    const formatted = `$${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    document.getElementById('balanceDisplay').textContent = formatted;
}

// Update withdraw currency
function updateWithdrawCurrency() {
    const selectedCurrency = document.getElementById('withdrawCurrency').value;
    const currencyInfo = currencyConverter.currencies[selectedCurrency];
    const rate = currencyConverter.exchangeRates[selectedCurrency];
    
    // Update label
    document.getElementById('withdrawAmountLabel').textContent = `Custom Amount (${selectedCurrency})`;
    
    // Update quick amount buttons
    const quickAmounts = [20, 50, 100, 200, 500];
    const buttonsContainer = document.getElementById('withdrawQuickAmounts');
    
    if (selectedCurrency === 'USD') {
        buttonsContainer.innerHTML = quickAmounts.map(amt => 
            `<button class="amount-btn" onclick="withdrawInCurrency(${amt})">$${amt}</button>`
        ).join('');
    } else {
        const convertedAmounts = quickAmounts.map(amt => {
            const converted = currencyConverter.convert(amt, 'USD', selectedCurrency);
            return Math.round(converted.amount);
        });
        
        buttonsContainer.innerHTML = convertedAmounts.map((amt, idx) => 
            `<button class="amount-btn" onclick="withdrawInCurrency(${quickAmounts[idx]})">${currencyInfo.symbol}${amt}</button>`
        ).join('');
    }
    
    // Update info box
    const infoBox = document.getElementById('withdrawCurrencyInfo');
    if (selectedCurrency !== 'USD') {
        infoBox.innerHTML = `
            ${currencyInfo.flag} <strong>Live Exchange Rate</strong><br>
            1 USD = ${rate.toFixed(4)} ${selectedCurrency} | Updated in real-time
        `;
        infoBox.style.display = 'block';
    } else {
        infoBox.style.display = 'none';
    }
    
    // Clear preview
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawPreview').classList.remove('show');
}

// Update deposit currency
function updateDepositCurrency() {
    const selectedCurrency = document.getElementById('depositCurrency').value;
    const currencyInfo = currencyConverter.currencies[selectedCurrency];
    const rate = currencyConverter.exchangeRates[selectedCurrency];
    
    // Update label
    document.getElementById('depositAmountLabel').textContent = `Enter Amount (${selectedCurrency})`;
    
    // Update info box
    const infoBox = document.getElementById('depositCurrencyInfo');
    if (selectedCurrency !== 'USD') {
        infoBox.innerHTML = `
            ${currencyInfo.flag} <strong>Live Exchange Rate</strong><br>
            1 USD = ${rate.toFixed(4)} ${selectedCurrency} | Updated in real-time
        `;
        infoBox.style.display = 'block';
    } else {
        infoBox.style.display = 'none';
    }
    
    // Clear preview
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositPreview').classList.remove('show');
}

// Add transaction
function addTransaction(type, amount, toAccount = null, anomalyAnalysis = null) {
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        balance: accounts[currentAccount].balance,
        date: new Date().toISOString(),
        toAccount: toAccount,
        anomalyScore: anomalyAnalysis ? anomalyAnalysis.anomalyScore : 0,
        aiVerified: anomalyAnalysis ? anomalyAnalysis.anomalyScore < 30 : true
    };
    
    accounts[currentAccount].transactions.unshift(transaction);
    saveToStorage();
}

// Withdraw in selected currency
function withdrawInCurrency(usdAmount) {
    const selectedCurrency = document.getElementById('withdrawCurrency').value;
    
    if (selectedCurrency === 'USD') {
        withdraw(usdAmount);
    } else {
        // Convert and show confirmation
        const converted = currencyConverter.convert(usdAmount, 'USD', selectedCurrency);
        const currencyInfo = currencyConverter.currencies[selectedCurrency];
        
        const message = `💳 Withdraw ${currencyConverter.formatCurrency(converted.amount, selectedCurrency)}?\n\n` +
            `Equivalent: $${usdAmount.toFixed(2)} USD\n` +
            `Rate: 1 USD = ${converted.rate.toFixed(4)} ${selectedCurrency}\n\n` +
            `Your virtual balance will be deducted in USD.`;
        
        if (confirm(message)) {
            withdraw(usdAmount, selectedCurrency, converted.amount);
        }
    }
}

// Withdraw
function withdraw(amount, displayCurrency = null, displayAmount = null) {
    // AI Anomaly Detection
    const anomalyAnalysis = anomalyDetector.analyzeTransaction(
        currentAccount, 
        'Withdrawal', 
        amount
    );
    
    // Check for anomalies
    if (anomalyAnalysis.isAnomaly && anomalyAnalysis.anomalyScore > 70) {
        showNotification(`🚨 AI Fraud Alert: ${anomalyAnalysis.details}`, 'error');
        
        setTimeout(() => {
            if (confirm(`AI detected unusual transaction pattern (Risk: ${anomalyAnalysis.anomalyScore}/100).\n\n${anomalyAnalysis.recommendation}\n\nProceed anyway?`)) {
                performWithdrawal(amount, anomalyAnalysis, displayCurrency, displayAmount);
            } else {
                showScreen('mainMenu');
            }
        }, 500);
        return;
    }
    
    performWithdrawal(amount, anomalyAnalysis, displayCurrency, displayAmount);
}

function performWithdrawal(amount, anomalyAnalysis, displayCurrency = null, displayAmount = null) {
    if (accounts[currentAccount].balance < amount) {
        showNotification('Insufficient funds!', 'error');
        return;
    }
    
    accounts[currentAccount].balance -= amount;
    addTransaction('Virtual Withdrawal', -amount, null, anomalyAnalysis);
    updateBalanceDisplay();
    
    const anomalyBadge = anomalyAnalysis.anomalyScore < 30 ? '✅ Safe' : 
                         anomalyAnalysis.anomalyScore < 60 ? '⚠️ Monitored' : '🚨 Flagged';
    
    let message = `✅ Virtual withdrawal processed ${anomalyBadge}\n\n`;
    
    if (displayCurrency && displayAmount) {
        const currencyInfo = currencyConverter.currencies[displayCurrency];
        message += `Amount: ${currencyInfo.symbol}${displayAmount.toFixed(2)} ${displayCurrency}\n`;
        message += `Deducted: $${amount.toFixed(2)} USD\n\n`;
    } else {
        message += `Amount: $${amount.toFixed(2)} USD\n\n`;
    }
    
    message += '💳 Your digital balance has been updated.';
    
    showNotification(message, 'success');
    showScreen('mainMenu');
}

function withdrawCustom() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const selectedCurrency = document.getElementById('withdrawCurrency').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    // Convert to USD if needed
    let usdAmount = amount;
    let displayAmount = amount;
    
    if (selectedCurrency !== 'USD') {
        const converted = currencyConverter.convert(amount, selectedCurrency, 'USD');
        usdAmount = converted.amount;
        displayAmount = amount;
    }
    
    if (usdAmount > 1000) {
        showNotification('Maximum withdrawal is $1,000 USD equivalent', 'error');
        return;
    }
    
    withdraw(usdAmount, selectedCurrency, displayAmount);
    document.getElementById('withdrawAmount').value = '';
}

// Deposit
function deposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const selectedCurrency = document.getElementById('depositCurrency').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    // Convert to USD if needed
    let usdAmount = amount;
    let displayAmount = amount;
    
    if (selectedCurrency !== 'USD') {
        const converted = currencyConverter.convert(amount, selectedCurrency, 'USD');
        usdAmount = converted.amount;
        displayAmount = amount;
    }
    
    if (usdAmount > 10000) {
        showNotification('Maximum deposit is $10,000 USD equivalent', 'error');
        return;
    }
    
    const currencyInfo = currencyConverter.currencies[selectedCurrency];
    const message = `💳 Deposit ${currencyInfo.symbol}${displayAmount.toFixed(2)} ${selectedCurrency}?\n\n` +
        (selectedCurrency !== 'USD' ? `Equivalent: $${usdAmount.toFixed(2)} USD\n` : '') +
        `Your virtual balance will be updated instantly.`;
    
    if (confirm(message)) {
        performDeposit(usdAmount, selectedCurrency, displayAmount);
    }
}

function performDeposit(amount, displayCurrency = null, displayAmount = null) {
    // AI Anomaly Detection for deposits
    const anomalyAnalysis = anomalyDetector.analyzeTransaction(
        currentAccount, 
        'Deposit', 
        amount
    );
    
    accounts[currentAccount].balance += amount;
    addTransaction('Virtual Deposit', amount, null, anomalyAnalysis);
    updateBalanceDisplay();
    
    const anomalyBadge = anomalyAnalysis.anomalyScore < 30 ? '✅' : '⚠️';
    
    let message = `${anomalyBadge} Virtual deposit processed\n\n`;
    
    if (displayCurrency && displayAmount && displayCurrency !== 'USD') {
        const currencyInfo = currencyConverter.currencies[displayCurrency];
        message += `Amount: ${currencyInfo.symbol}${displayAmount.toFixed(2)} ${displayCurrency}\n`;
        message += `Added: $${amount.toFixed(2)} USD\n\n`;
    } else {
        message += `Amount: $${amount.toFixed(2)} USD\n\n`;
    }
    
    message += '💳 Your digital balance has been updated.';
    
    showNotification(message, 'success');
    document.getElementById('depositAmount').value = '';
    showScreen('mainMenu');
}

// Transfer
function transfer() {
    const toAccount = document.getElementById('transferAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    
    if (!toAccount || !amount) {
        showNotification('Please enter account number and amount', 'error');
        return;
    }
    
    if (!accounts[toAccount]) {
        showNotification('Invalid account number', 'error');
        return;
    }
    
    if (toAccount === currentAccount) {
        showNotification('Cannot transfer to same account', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    if (accounts[currentAccount].balance < amount) {
        showNotification('Insufficient funds!', 'error');
        return;
    }
    
    // AI Anomaly Detection for transfers
    const anomalyAnalysis = anomalyDetector.analyzeTransaction(
        currentAccount, 
        'Transfer', 
        amount
    );
    
    if (anomalyAnalysis.isAnomaly && anomalyAnalysis.anomalyScore > 60) {
        showNotification(`🚨 AI Alert: ${anomalyAnalysis.details}`, 'error');
        
        setTimeout(() => {
            if (confirm(`Unusual transfer detected (Risk: ${anomalyAnalysis.anomalyScore}/100).\n\nProceed?`)) {
                performTransfer(toAccount, amount, anomalyAnalysis);
            }
        }, 500);
        return;
    }
    
    performTransfer(toAccount, amount, anomalyAnalysis);
}

function performTransfer(toAccount, amount, anomalyAnalysis) {
    const toAccountName = accounts[toAccount].name;
    const message = `💳 Digital Transfer Confirmation:\n\n` +
        `From: ${accounts[currentAccount].name}\n` +
        `To: ${toAccountName}\n` +
        `Amount: $${amount.toFixed(2)}\n\n` +
        `This is a virtual transaction - balances will be updated digitally.\n\n` +
        `Proceed with transfer?`;
    
    if (!confirm(message)) {
        showScreen('transferScreen');
        return;
    }
    
    // Perform transfer
    accounts[currentAccount].balance -= amount;
    accounts[toAccount].balance += amount;
    
    addTransaction('Digital Transfer Out', -amount, toAccount, anomalyAnalysis);
    accounts[toAccount].transactions.unshift({
        id: Date.now(),
        type: 'Digital Transfer In',
        amount: amount,
        balance: accounts[toAccount].balance,
        date: new Date().toISOString(),
        fromAccount: currentAccount,
        anomalyScore: anomalyAnalysis.anomalyScore
    });
    
    updateBalanceDisplay();
    showNotification(`✅ Digital transfer completed: $${amount.toFixed(2)} to ${toAccountName}`, 'success');
    document.getElementById('transferAccount').value = '';
    document.getElementById('transferAmount').value = '';
    showScreen('mainMenu');
}

// Change PIN
function changePin() {
    const currentPin = document.getElementById('currentPin').value;
    const newPin = document.getElementById('newPin').value;
    const confirmPin = document.getElementById('confirmPin').value;
    
    if (!currentPin || !newPin || !confirmPin) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (accounts[currentAccount].pin !== currentPin) {
        showNotification('Current PIN is incorrect', 'error');
        return;
    }
    
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        showNotification('PIN must be 4 digits', 'error');
        return;
    }
    
    if (newPin !== confirmPin) {
        showNotification('New PINs do not match', 'error');
        return;
    }
    
    accounts[currentAccount].pin = newPin;
    saveToStorage();
    showNotification('PIN changed successfully!', 'success');
    document.getElementById('currentPin').value = '';
    document.getElementById('newPin').value = '';
    document.getElementById('confirmPin').value = '';
    showScreen('mainMenu');
}

// Display transactions
function displayTransactions() {
    const listElement = document.getElementById('transactionList');
    const transactions = accounts[currentAccount].transactions;
    
    if (transactions.length === 0) {
        listElement.innerHTML = '<p style="text-align: center; padding: 20px; color: #95a5a6;">No transactions yet</p>';
        return;
    }
    
    listElement.innerHTML = transactions.slice(0, 20).map(t => {
        const date = new Date(t.date);
        const isPositive = t.amount > 0;
        const extraInfo = t.toAccount ? ` to ${t.toAccount}` : (t.fromAccount ? ` from ${t.fromAccount}` : '');
        
        // AI Badge
        let aiBadge = '';
        if (t.anomalyScore !== undefined) {
            if (t.anomalyScore < 30) {
                aiBadge = '<span class="anomaly-badge safe">✓ AI Verified</span>';
            } else if (t.anomalyScore < 60) {
                aiBadge = '<span class="anomaly-badge warning">⚠ Monitored</span>';
            } else {
                aiBadge = '<span class="anomaly-badge danger">🚨 Flagged</span>';
            }
        }
        
        return `
            <div class="transaction-item">
                <div>
                    <div class="transaction-type">${t.type}${extraInfo} ${aiBadge}</div>
                    <div class="transaction-date">${date.toLocaleString()}</div>
                </div>
                <div style="text-align: right;">
                    <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}
                    </div>
                    <div class="transaction-date">Balance: $${t.balance.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Download receipt
function downloadReceipt() {
    const transactions = accounts[currentAccount].transactions.slice(0, 20);
    const account = accounts[currentAccount];

    // Generate receipt content
    let receiptHTML = `
        <div class="receipt-bank-header">
            <h1>🏦 SecureBank ATM</h1>
            <p>Virtual ATM Web Portal</p>
            <p>Digital Banking Simulation</p>
        </div>

        <div class="receipt-info">
            <div class="receipt-info-row">
                <span><strong>Account:</strong></span>
                <span>${currentAccount}</span>
            </div>
            <div class="receipt-info-row">
                <span><strong>Name:</strong></span>
                <span>${account.name}</span>
            </div>
            <div class="receipt-info-row">
                <span><strong>Date:</strong></span>
                <span>${new Date().toLocaleString()}</span>
            </div>
            <div class="receipt-info-row border-top border-bottom">
                <span><strong>Current Balance:</strong></span>
                <span><strong>$${account.balance.toFixed(2)}</strong></span>
            </div>
        </div>

        <div class="receipt-transactions">
            <h3 style="text-align: center; margin-bottom: 20px;">Recent Transactions</h3>
    `;

    if (transactions.length === 0) {
        receiptHTML += `
            <div style="text-align: center; padding: 20px; color: #666;">
                No transactions found
            </div>
        `;
    } else {
        transactions.forEach(t => {
            const date = new Date(t.date);
            const isPositive = t.amount > 0;
            const extraInfo = t.toAccount ? ` to ${t.toAccount}` : (t.fromAccount ? ` from ${t.fromAccount}` : '');

            // AI Badge
            let aiBadge = '';
            if (t.anomalyScore !== undefined) {
                if (t.anomalyScore < 30) {
                    aiBadge = '<span style="color: #27ae60; font-size: 0.8rem;">✓ AI Verified</span>';
                } else if (t.anomalyScore < 60) {
                    aiBadge = '<span style="color: #f39c12; font-size: 0.8rem;">⚠ Monitored</span>';
                } else {
                    aiBadge = '<span style="color: #e74c3c; font-size: 0.8rem;">🚨 Flagged</span>';
                }
            }

            receiptHTML += `
                <div class="receipt-transaction-item">
                    <div class="receipt-transaction-header">
                        <span class="receipt-transaction-type">${t.type}${extraInfo}</span>
                        <span class="receipt-transaction-amount ${isPositive ? 'positive' : 'negative'}">
                            ${isPositive ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}
                        </span>
                    </div>
                    <div class="receipt-transaction-details">
                        <span>${date.toLocaleString()}</span>
                        <span>Balance: $${t.balance.toFixed(2)}</span>
                    </div>
                    ${aiBadge ? `<div style="margin-top: 5px;">${aiBadge}</div>` : ''}
                </div>
            `;
        });
    }

    receiptHTML += `
        </div>

        <div class="receipt-info" style="margin-top: 30px;">
            <div class="receipt-info-row border-top">
                <span><strong>Receipt ID:</strong></span>
                <span>RCP-${Date.now()}</span>
            </div>
            <div class="receipt-info-row">
                <span><strong>Generated:</strong></span>
                <span>${new Date().toLocaleString()}</span>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; font-size: 0.9rem; color: #666;">
            <p><strong>Thank you for using SecureBank Virtual ATM</strong></p>
            <p>AI-Powered Digital Banking • Secure • Reliable</p>
        </div>
    `;

    // Show the modal
    document.getElementById('receiptContent').innerHTML = receiptHTML;
    document.getElementById('receiptModalOverlay').classList.add('active');
}


// Add event listeners for Enter key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen.id === 'loginScreen') {
            login();
        }
    }
});
// Close receipt modal
function closeReceiptModal() {
    document.getElementById('receiptModalOverlay').classList.remove('active');
}

// Print receipt
function printReceipt() {
    window.print();
}

// Download receipt as file
function downloadReceiptFile() {
    const transactions = accounts[currentAccount].transactions.slice(0, 20);
    const account = accounts[currentAccount];
    
    let receipt = `SecureBank ATM Receipt\n`;
    receipt += `=================================\n`;
    receipt += `Account: ${currentAccount}\n`;
    receipt += `Name: ${account.name}\n`;
    receipt += `Date: ${new Date().toLocaleString()}\n`;
    receipt += `Current Balance: $${account.balance.toFixed(2)}\n`;
    receipt += `=================================\n\n`;
    receipt += `Recent Transactions:\n\n`;
    
    transactions.forEach(t => {
        const date = new Date(t.date);
        receipt += `${date.toLocaleString()}\n`;
        receipt += `${t.type}: ${t.amount > 0 ? '+' : ''}$${t.amount.toFixed(2)}\n`;
        receipt += `Balance: $${t.balance.toFixed(2)}\n`;
        receipt += `---------------------------------\n`;
    });
    
    receipt += `\nReceipt ID: RCP-${Date.now()}\n`;
    receipt += `Generated: ${new Date().toLocaleString()}\n\n`;
    receipt += `Thank you for using SecureBank Virtual ATM\n`;
    receipt += `AI-Powered Digital Banking • Secure • Reliable\n`;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecureBank_Receipt_${currentAccount}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Receipt downloaded successfully!', 'success');
    closeReceiptModal();
}

// Welcome screen - Terms acceptance
document.addEventListener('DOMContentLoaded', () => {
    const acceptTermsCheckbox = document.getElementById('acceptTerms');
    const proceedBtn = document.getElementById('proceedBtn');
    
    if (acceptTermsCheckbox && proceedBtn) {
        acceptTermsCheckbox.addEventListener('change', function() {
            proceedBtn.disabled = !this.checked;
        });
    }
});

// Proceed to login screen
function proceedToLogin() {
    const acceptTerms = document.getElementById('acceptTerms');
    
    if (!acceptTerms.checked) {
        showNotification('Please accept the terms and conditions to continue', 'error');
        return;
    }
    
    // Store acceptance in localStorage
    localStorage.setItem('termsAccepted', 'true');
    
    // Show login screen
    showScreen('loginScreen');
    showNotification('Welcome to SecureBank Virtual ATM! 🏦', 'info');
}

// Check if terms were already accepted
function checkTermsAcceptance() {
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (termsAccepted === 'true') {
        showScreen('loginScreen');
    } else {
        showScreen('welcomeScreen');
    }
}

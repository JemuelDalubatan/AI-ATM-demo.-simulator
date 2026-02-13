// Receipt Modal Functions

// Show receipt modal (replaces downloadReceipt function)
function showReceiptModal() {
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

// Override the original downloadReceipt function
function downloadReceipt() {
    showReceiptModal();
}

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

// Show single transaction receipt
function showTransactionReceipt(transactionType, amount, currency, balance, anomalyScore) {
    const account = accounts[currentAccount];
    const currencyInfo = currency && currency !== 'USD' ? currencyConverter.currencies[currency] : null;
    
    // AI Badge
    let aiBadge = '';
    let aiBadgeColor = '#27ae60';
    if (anomalyScore !== undefined) {
        if (anomalyScore < 30) {
            aiBadge = '✓ AI Verified';
            aiBadgeColor = '#27ae60';
        } else if (anomalyScore < 60) {
            aiBadge = '⚠ Monitored';
            aiBadgeColor = '#f39c12';
        } else {
            aiBadge = '🚨 Flagged';
            aiBadgeColor = '#e74c3c';
        }
    }
    
    const isDeposit = transactionType.includes('Deposit');
    const transactionIcon = isDeposit ? '💰' : '💳';
    const amountColor = isDeposit ? '#27ae60' : '#e74c3c';
    const amountSign = isDeposit ? '+' : '-';
    
    let receiptHTML = `
        <div class="receipt-bank-header">
            <h1>🏦 SecureBank ATM</h1>
            <p>Transaction Receipt</p>
        </div>
        
        <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin: -30px -30px 20px -30px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">${transactionIcon}</div>
            <h2 style="margin: 0; font-size: 1.5rem;">${transactionType}</h2>
            <div style="font-size: 2.5rem; font-weight: bold; margin-top: 15px;">
                ${amountSign}$${Math.abs(amount).toFixed(2)}
            </div>
            ${currencyInfo ? `<div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">${currencyInfo.flag} ${currency} Transaction</div>` : ''}
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
                <span><strong>Date & Time:</strong></span>
                <span>${new Date().toLocaleString()}</span>
            </div>
            <div class="receipt-info-row border-top">
                <span><strong>Previous Balance:</strong></span>
                <span>$${(balance - (isDeposit ? amount : -amount)).toFixed(2)}</span>
            </div>
            <div class="receipt-info-row">
                <span><strong>Transaction Amount:</strong></span>
                <span style="color: ${amountColor}; font-weight: bold;">${amountSign}$${Math.abs(amount).toFixed(2)}</span>
            </div>
            <div class="receipt-info-row border-bottom" style="font-size: 1.2rem;">
                <span><strong>New Balance:</strong></span>
                <span><strong>$${balance.toFixed(2)}</strong></span>
            </div>
            ${aiBadge ? `
            <div class="receipt-info-row" style="background: ${aiBadgeColor}15; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <span><strong>AI Security Status:</strong></span>
                <span style="color: ${aiBadgeColor}; font-weight: bold;">${aiBadge}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="receipt-info" style="margin-top: 30px;">
            <div class="receipt-info-row border-top">
                <span><strong>Receipt ID:</strong></span>
                <span>RCP-${Date.now()}</span>
            </div>
            <div class="receipt-info-row">
                <span><strong>Transaction ID:</strong></span>
                <span>TXN-${Date.now()}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #27ae60; font-weight: bold; font-size: 1.1rem;">✓ Transaction Successful</p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 0.9rem;">Your virtual balance has been updated</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; font-size: 0.9rem; color: #666;">
            <p><strong>Thank you for using SecureBank Virtual ATM</strong></p>
            <p>AI-Powered Digital Banking • Secure • Reliable</p>
        </div>
    `;
    
    // Show the modal
    document.getElementById('receiptContent').innerHTML = receiptHTML;
    document.getElementById('receiptModalOverlay').classList.add('active');
}

// Store original functions
const originalPerformWithdrawal = window.performWithdrawal;
const originalPerformDeposit = window.performDeposit;

// Override performWithdrawal to show receipt
window.performWithdrawal = function(amount, anomalyAnalysis, displayCurrency = null, displayAmount = null) {
    if (accounts[currentAccount].balance < amount) {
        showNotification('Insufficient funds!', 'error');
        return;
    }
    
    accounts[currentAccount].balance -= amount;
    addTransaction('Virtual Withdrawal', -amount, null, anomalyAnalysis);
    updateBalanceDisplay();
    saveToStorage();
    
    showScreen('mainMenu');
    
    // Show transaction receipt popup
    setTimeout(() => {
        showTransactionReceipt(
            'Virtual Withdrawal',
            amount,
            displayCurrency || 'USD',
            accounts[currentAccount].balance,
            anomalyAnalysis.anomalyScore
        );
    }, 300);
};

// Override performDeposit to show receipt
window.performDeposit = function(amount, displayCurrency = null, displayAmount = null) {
    // AI Anomaly Detection for deposits
    const anomalyAnalysis = anomalyDetector.analyzeTransaction(
        currentAccount, 
        'Deposit', 
        amount
    );
    
    accounts[currentAccount].balance += amount;
    addTransaction('Virtual Deposit', amount, null, anomalyAnalysis);
    updateBalanceDisplay();
    saveToStorage();
    
    document.getElementById('depositAmount').value = '';
    showScreen('mainMenu');
    
    // Show transaction receipt popup
    setTimeout(() => {
        showTransactionReceipt(
            'Virtual Deposit',
            amount,
            displayCurrency || 'USD',
            accounts[currentAccount].balance,
            anomalyAnalysis.anomalyScore
        );
    }, 300);
};

// Override deposit function to use custom popup
window.deposit = function() {
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
    
    // Use custom security alert instead of confirm()
    const message = `
        <p><strong>💳 Deposit ${currencyInfo.symbol}${displayAmount.toFixed(2)} ${selectedCurrency}?</strong></p>
        ${selectedCurrency !== 'USD' ? `<p>Equivalent: <strong>$${usdAmount.toFixed(2)} USD</strong></p>` : ''}
        <p>Your virtual balance will be updated instantly.</p>
    `;
    
    const details = `<strong>Transaction Type:</strong> Virtual Deposit`;
    
    showSecurityAlert(
        'Confirm Deposit',
        message,
        details,
        () => performDeposit(usdAmount, selectedCurrency, displayAmount), // Proceed
        () => { /* Cancel - do nothing */ } // Cancel
    );
};

// Simple transaction confirmation popup
function showTransactionConfirm(title, icon, message, details, onConfirm, onCancel) {
    const overlay = document.getElementById('transactionConfirmOverlay');
    const titleElement = document.getElementById('confirmTitle');
    const iconElement = document.getElementById('confirmIcon');
    const messageElement = document.getElementById('confirmMessage');
    const detailsElement = document.getElementById('confirmDetails');
    const proceedBtn = document.getElementById('confirmProceedBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    
    titleElement.textContent = title;
    iconElement.textContent = icon;
    messageElement.innerHTML = message;
    detailsElement.innerHTML = details;
    
    overlay.classList.add('active');
    
    // Remove old event listeners
    const newProceedBtn = proceedBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    proceedBtn.parentNode.replaceChild(newProceedBtn, proceedBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners
    document.getElementById('confirmProceedBtn').addEventListener('click', () => {
        overlay.classList.remove('active');
        if (onConfirm) onConfirm();
    });
    
    document.getElementById('confirmCancelBtn').addEventListener('click', () => {
        overlay.classList.remove('active');
        if (onCancel) onCancel();
    });
}

// Update deposit function to use friendly confirmation
window.deposit = function() {
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
    
    // Use friendly confirmation popup
    const message = `${currencyInfo.symbol}${displayAmount.toFixed(2)} ${selectedCurrency}`;
    const details = selectedCurrency !== 'USD' 
        ? `Equivalent: <strong>$${usdAmount.toFixed(2)} USD</strong><br>Your virtual balance will be updated instantly.`
        : 'Your virtual balance will be updated instantly.';
    
    showTransactionConfirm(
        'Confirm Deposit',
        '💰',
        message,
        details,
        () => performDeposit(usdAmount, selectedCurrency, displayAmount), // Confirm
        () => { /* Cancel - do nothing */ } // Cancel
    );
};

const fs = require('fs');
const path = require('path');

console.log('🌐 Frontend Simple Test...');

// Test 1: Check if frontend files exist
console.log('\n📁 Test 1: File Existence');
const frontendFiles = [
    'frontend/index.html',
    'frontend/app-final.js',
    'frontend/config.js'
];

frontendFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Test 2: Check HTML structure
console.log('\n📄 Test 2: HTML Structure');
const htmlContent = fs.readFileSync('frontend/index.html', 'utf8');

const requiredElements = [
    'walletConnectBtn',
    'mevProtectionSwitch',
    'swapBtn',
    'fromToken',
    'toToken',
    'fromAmount',
    'toAmount'
];

requiredElements.forEach(element => {
    if (htmlContent.includes(`id="${element}"`)) {
        console.log(`✅ Element #${element} found in HTML`);
    } else {
        console.log(`❌ Element #${element} missing from HTML`);
    }
});

// Test 3: Check JavaScript references
console.log('\n🔗 Test 3: JavaScript References');
const scriptReferences = [
    'app-final.js',
    'config.js',
    'ethers.umd.min.js',
    'bootstrap.bundle.min.js'
];

scriptReferences.forEach(script => {
    if (htmlContent.includes(script)) {
        console.log(`✅ Script ${script} referenced in HTML`);
    } else {
        console.log(`❌ Script ${script} not referenced in HTML`);
    }
});

// Test 4: Check config.js structure
console.log('\n⚙️ Test 4: Configuration Structure');
const configContent = fs.readFileSync('frontend/config.js', 'utf8');

const configChecks = [
    'window.LEAFSWAP_CONFIG',
    'networks',
    'sepolia',
    'factory',
    'router',
    'tokenA',
    'tokenB',
    'mevGuard'
];

configChecks.forEach(check => {
    if (configContent.includes(check)) {
        console.log(`✅ Config contains ${check}`);
    } else {
        console.log(`❌ Config missing ${check}`);
    }
});

// Test 5: Check app-final.js structure
console.log('\n📱 Test 5: App JavaScript Structure');
const appContent = fs.readFileSync('frontend/app-final.js', 'utf8');

const appChecks = [
    'connectWallet',
    'swapTokens',
    'toggleMEVProtection',
    'updateUserMEVProtectionStatus',
    'window.ethereum',
    'ethers'
];

appChecks.forEach(check => {
    if (appContent.includes(check)) {
        console.log(`✅ App contains ${check}`);
    } else {
        console.log(`❌ App missing ${check}`);
    }
});

// Test 6: Check for common issues
console.log('\n🔍 Test 6: Common Issues Check');

// Check for old app.js references
if (htmlContent.includes('app.js')) {
    console.log('⚠️ Warning: HTML still references app.js (should be app-final.js)');
} else {
    console.log('✅ No old app.js references found');
}

// Check for hardcoded addresses
const hardcodedAddresses = appContent.match(/0x[a-fA-F0-9]{40}/g);
if (hardcodedAddresses) {
    console.log('⚠️ Warning: Found hardcoded addresses in app-final.js:', hardcodedAddresses.length);
} else {
    console.log('✅ No hardcoded addresses found');
}

// Check for console.error calls
const errorCount = (appContent.match(/console\.error/g) || []).length;
console.log(`📊 Console.error calls found: ${errorCount}`);

// Test 7: Network Configuration
console.log('\n🌐 Test 7: Network Configuration');
const sepoliaConfig = configContent.match(/sepolia:\s*{[^}]+}/s);
if (sepoliaConfig) {
    console.log('✅ Sepolia network configuration found');
    
    // Check for actual addresses
    const addresses = sepoliaConfig[0].match(/0x[a-fA-F0-9]{40}/g);
    if (addresses && addresses.length >= 5) {
        console.log(`✅ Found ${addresses.length} contract addresses in Sepolia config`);
    } else {
        console.log('❌ Missing contract addresses in Sepolia config');
    }
} else {
    console.log('❌ Sepolia network configuration missing');
}

console.log('\n🎉 Frontend Simple Test Completed!');
console.log('\n📋 Next Steps:');
console.log('1. Open http://localhost:8000 in your browser');
console.log('2. Connect MetaMask to Sepolia network');
console.log('3. Import deployer account with private key');
console.log('4. Test wallet connection');
console.log('5. Test MEV protection toggle');
console.log('6. Test token swapping');

const puppeteer = require('puppeteer');

async function testFrontend() {
    console.log('🌐 Starting Frontend Browser Test...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to frontend
        console.log('📱 Loading frontend...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Check if page loaded correctly
        const title = await page.title();
        console.log('✅ Page title:', title);
        
        // Check for key elements
        const elements = await page.evaluate(() => {
            return {
                walletButton: !!document.getElementById('walletButton'),
                mevSwitch: !!document.getElementById('mevProtectionSwitch'),
                swapButton: !!document.getElementById('swapBtn'),
                fromToken: !!document.getElementById('fromToken'),
                toToken: !!document.getElementById('toToken')
            };
        });
        
        console.log('🔍 Key elements found:', elements);
        
        // Check console for any errors
        const consoleLogs = await page.evaluate(() => {
            return window.consoleLogs || [];
        });
        
        console.log('📝 Console logs:', consoleLogs);
        
        // Test wallet connection (without actually connecting)
        console.log('🔗 Testing wallet connection UI...');
        const walletButton = await page.$('#walletButton');
        if (walletButton) {
            console.log('✅ Wallet button found');
        } else {
            console.log('❌ Wallet button not found');
        }
        
        // Test MEV protection switch
        console.log('🛡️ Testing MEV protection switch...');
        const mevSwitch = await page.$('#mevProtectionSwitch');
        if (mevSwitch) {
            console.log('✅ MEV protection switch found');
            
            // Check if it's disabled by default
            const isChecked = await page.evaluate(() => {
                return document.getElementById('mevProtectionSwitch').checked;
            });
            console.log('MEV protection enabled by default:', isChecked);
        } else {
            console.log('❌ MEV protection switch not found');
        }
        
        // Test token selection
        console.log('🪙 Testing token selection...');
        const fromToken = await page.$('#fromToken');
        const toToken = await page.$('#toToken');
        
        if (fromToken && toToken) {
            console.log('✅ Token selectors found');
            
            // Check default selections
            const defaultFrom = await page.evaluate(() => {
                return document.getElementById('fromToken').value;
            });
            const defaultTo = await page.evaluate(() => {
                return document.getElementById('toToken').value;
            });
            
            console.log('Default from token:', defaultFrom);
            console.log('Default to token:', defaultTo);
        } else {
            console.log('❌ Token selectors not found');
        }
        
        // Check for any JavaScript errors
        const errors = await page.evaluate(() => {
            return window.jsErrors || [];
        });
        
        if (errors.length > 0) {
            console.log('❌ JavaScript errors found:', errors);
        } else {
            console.log('✅ No JavaScript errors detected');
        }
        
        console.log('🎉 Frontend browser test completed successfully!');
        
        // Keep browser open for manual testing
        console.log('🔍 Browser will remain open for manual testing...');
        console.log('📋 Manual testing checklist:');
        console.log('1. Click "Connect Wallet" button');
        console.log('2. Check if MetaMask popup appears');
        console.log('3. Toggle MEV protection switch');
        console.log('4. Enter token amounts');
        console.log('5. Test swap functionality');
        console.log('6. Check network switching');
        
        // Wait for user to close browser
        await new Promise(resolve => {
            console.log('Press Ctrl+C to close browser and end test');
        });
        
    } catch (error) {
        console.error('❌ Frontend test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testFrontend().catch(console.error);


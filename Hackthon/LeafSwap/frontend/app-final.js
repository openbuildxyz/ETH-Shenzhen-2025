// Final app.js - Complete and independent
console.log('Final app.js loading...');

// Global variables
let provider, signer, router, factory, mevGuard;
let connected = false;
let currentBlock = 0;
let mevConfig = {
    protectionDuration: 100,
    mevFee: 1.0,
    minTxSize: 0.5
};

// MEV protection state
let mevProtectionEnabled = false;

// Contract addresses
let CONTRACT_ADDRESSES = {
    factory: '',
    router: '',
    weth: '',
    tokenA: '',
    tokenB: '',
    mevGuard: '',
    configManager: ''
};

// Update contract addresses from config if available
function updateContractAddresses() {
    if (window.LEAFSWAP_CONFIG && window.LEAFSWAP_CONFIG.networks) {
        const networkName = getCurrentNetworkName();
        const addresses = window.LEAFSWAP_CONFIG.networks[networkName];
        if (addresses) {
            Object.assign(CONTRACT_ADDRESSES, addresses);
            console.log('Updated contract addresses for network:', networkName, addresses);
        }
    }
    console.log('Using contract addresses:', CONTRACT_ADDRESSES);
}

// Get current network name
function getCurrentNetworkName() {
    if (window.ethereum && window.ethereum.chainId) {
        const chainId = parseInt(window.ethereum.chainId, 16);
        if (chainId === 31337) return 'localhost';
        if (chainId === 11155111) return 'sepolia';
    }
    return 'sepolia'; // default to sepolia for testing
}

// Basic ABI definitions
const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
    "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)"
];

const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    "function MEVGuard() external view returns (address)"
];

const MEVGUARD_ABI = [
    "function isUserMEVEnabled(address user) external view returns (bool)",
    "function setUserMEVEnabled(address user, bool enabled) external"
];

const CONFIG_MANAGER_ABI = [
    "function updateConfig(uint256 _newSwapFeeRate, uint256 _newMaxSlippage, uint256 _newMinLiquidity) external",
    "function getConfig() external view returns (uint256 swapFeeRate, uint256 maxSlippage, uint256 minLiquidity)",
    "function isConfigValid() external view returns (bool)",
    "function pause() external",
    "function unpause() external",
    "function owner() external view returns (address)"
];

const TOKEN_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
];

// Check and switch to Sepolia network
async function checkAndSwitchNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const sepoliaChainId = '0xaa36a7'; // Sepolia chain ID in hex
        
        if (chainId !== sepoliaChainId) {
            console.log('Current network is not Sepolia, attempting to switch...');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }],
                });
                console.log('Successfully switched to Sepolia network');
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    console.log('Sepolia network not found, attempting to add...');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: sepoliaChainId,
                                chainName: 'Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'Sepolia Ether',
                                    symbol: 'SEP',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io/']
                            }],
                        });
                        console.log('Successfully added Sepolia network');
                    } catch (addError) {
                        console.error('Failed to add Sepolia network:', addError);
                        alert('Please manually add Sepolia testnet to MetaMask');
                    }
                } else {
                    console.error('Failed to switch to Sepolia network:', switchError);
                    alert('Please manually switch to Sepolia testnet in MetaMask');
                }
            }
        } else {
            console.log('Already on Sepolia network');
        }
    } catch (error) {
        console.error('Error checking/switching network:', error);
    }
}

// Connect wallet function
async function connectWallet() {
    try {
        console.log('Connecting wallet...');
        
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return;
        }

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        console.log('Connected account:', account);
        
        // Create provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Check and switch to Sepolia network
        await checkAndSwitchNetwork();
        
        // Update contract addresses
        updateContractAddresses();
        
        // Initialize contracts
        await initializeContracts();
        
        // Update UI
        updateNetworkInfo();
        updateWalletInfo();
        
        connected = true;
        console.log('Wallet connected successfully');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet: ' + error.message);
    }
}

// Initialize contracts
async function initializeContracts() {
    try {
        console.log('Initializing contracts...');
        
        if (!CONTRACT_ADDRESSES.factory || !CONTRACT_ADDRESSES.router || !CONTRACT_ADDRESSES.mevGuard) {
            console.error('Contract addresses not loaded');
            return;
        }
        
        // Initialize contract instances
        factory = new ethers.Contract(CONTRACT_ADDRESSES.factory, FACTORY_ABI, signer);
        router = new ethers.Contract(CONTRACT_ADDRESSES.router, ROUTER_ABI, signer);
        mevGuard = new ethers.Contract(CONTRACT_ADDRESSES.mevGuard, MEVGUARD_ABI, signer);
        
        console.log('Contracts initialized:', {
            factory: factory.address,
            router: router.address,
            mevGuard: mevGuard.address
        });
        
        // Load token balances
        await loadTokenBalances();
        
    } catch (error) {
        console.error('Error initializing contracts:', error);
    }
}

// Load token balances
async function loadTokenBalances() {
    try {
        if (!CONTRACT_ADDRESSES.tokenA || !CONTRACT_ADDRESSES.tokenB) {
            console.error('Token addresses not loaded');
            return;
        }
        
        const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.tokenA, TOKEN_ABI, signer);
        const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.tokenB, TOKEN_ABI, signer);
        
        const account = await signer.getAddress();
        const balanceA = await tokenA.balanceOf(account);
        const balanceB = await tokenB.balanceOf(account);
        
        // Store balances globally for use in other functions
        window.tokenBalances = {
            TKA: ethers.utils.formatEther(balanceA),
            TKB: ethers.utils.formatEther(balanceB)
        };
        
        // Update UI based on selected tokens
        updateBalanceDisplay();
        
        console.log('Token balances loaded:', window.tokenBalances);
        
    } catch (error) {
        console.error('Error loading token balances:', error);
    }
}

// Update balance display based on selected tokens
function updateBalanceDisplay() {
    if (!window.tokenBalances) return;
    
    const fromTokenSelect = document.getElementById('fromToken');
    const toTokenSelect = document.getElementById('toToken');
    const fromBalanceElement = document.getElementById('fromBalance');
    const toBalanceElement = document.getElementById('toBalance');
    
    if (fromTokenSelect && fromBalanceElement) {
        const fromToken = fromTokenSelect.value;
        const fromBalance = window.tokenBalances[fromToken] || '0.0';
        fromBalanceElement.textContent = fromBalance;
    }
    
    if (toTokenSelect && toBalanceElement) {
        const toToken = toTokenSelect.value;
        const toBalance = window.tokenBalances[toToken] || '0.0';
        toBalanceElement.textContent = toBalance;
    }
}

// Update network information
function updateNetworkInfo() {
    const networkInfo = document.getElementById('networkInfo');
    if (networkInfo) {
        networkInfo.textContent = 'Sepolia Testnet';
    }
}

// Update wallet information
function updateWalletInfo() {
    const walletConnectBtn = document.getElementById('walletConnectBtn');
    if (walletConnectBtn && signer) {
        signer.getAddress().then(address => {
            const shortAddress = address.substring(0, 6) + '...' + address.substring(38);
            walletConnectBtn.innerHTML = `<i class="fas fa-wallet me-2"></i>${shortAddress}`;
        });
    }
    // 如果没有walletConnectBtn元素，就不更新UI，但也不报错
}

// Toggle MEV protection
async function toggleMEVProtection() {
    try {
        if (!mevGuard || !signer) {
            alert('Please connect wallet first');
            return;
        }
        
        const account = await signer.getAddress();
        const currentStatus = await mevGuard.isUserMEVEnabled(account);
        const newStatus = !currentStatus;
        
        const tx = await mevGuard.setUserMEVEnabled(account, newStatus);
        await tx.wait();
        
        mevProtectionEnabled = newStatus;
        updateMEVProtectionUI();
        
        console.log('MEV protection toggled:', newStatus);
        
    } catch (error) {
        console.error('Error toggling MEV protection:', error);
        alert('Failed to toggle MEV protection: ' + error.message);
    }
}

// Update MEV protection UI
function updateMEVProtectionUI() {
    const mevSwitch = document.getElementById('mevProtectionSwitch');
    if (mevSwitch) {
        mevSwitch.checked = mevProtectionEnabled;
    }
    
    const mevStatus = document.getElementById('mevProtectionStatus');
    if (mevStatus) {
        if (mevProtectionEnabled) {
            mevStatus.classList.remove('d-none');
            mevStatus.classList.add('d-block');
        } else {
            mevStatus.classList.remove('d-block');
            mevStatus.classList.add('d-none');
        }
    }
}

// Swap tokens function
async function swapTokens() {
    try {
        if (!router || !signer) {
            alert('Please connect wallet first');
            return;
        }
        
        const amountIn = document.getElementById('fromAmount').value;
        const amountOutMin = document.getElementById('toAmount').value;
        
        if (!amountIn || !amountOutMin) {
            alert('Please enter swap amounts');
            return;
        }
        
        const fromTokenSelect = document.getElementById('fromToken');
        const toTokenSelect = document.getElementById('toToken');
        
        if (!fromTokenSelect || !toTokenSelect) {
            alert('Token selectors not found');
            return;
        }
        
        const fromToken = fromTokenSelect.value;
        const toToken = toTokenSelect.value;
        
        // Don't swap if same token
        if (fromToken === toToken) {
            alert('Cannot swap same token');
            return;
        }
        
        const amountInWei = ethers.utils.parseEther(amountIn);
        
        // Get token addresses based on selection
        const fromTokenAddress = fromToken === 'TKA' ? CONTRACT_ADDRESSES.tokenA : 
                                fromToken === 'TKB' ? CONTRACT_ADDRESSES.tokenB : 
                                CONTRACT_ADDRESSES.weth;
        const toTokenAddress = toToken === 'TKA' ? CONTRACT_ADDRESSES.tokenA : 
                              toToken === 'TKB' ? CONTRACT_ADDRESSES.tokenB : 
                              CONTRACT_ADDRESSES.weth;
        
        // Calculate expected output and apply slippage tolerance
        const path = [fromTokenAddress, toTokenAddress];
        const amounts = await router.getAmountsOut(amountInWei, path);
        const expectedOutput = amounts[1];
        
        // Apply 5% slippage tolerance (0.95 = 95% of expected output)
        const slippageTolerance = 0.95;
        const amountOutMinWei = expectedOutput.mul(ethers.BigNumber.from(Math.floor(slippageTolerance * 1000))).div(1000);
        
        console.log('Swap calculation with slippage:', {
            expectedOutput: ethers.utils.formatEther(expectedOutput),
            amountOutMin: ethers.utils.formatEther(amountOutMinWei),
            slippageTolerance: slippageTolerance
        });
        const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        
        console.log('Swapping tokens:', {
            fromToken: fromToken,
            toToken: toToken,
            amountIn: amountIn,
            amountOutMin: amountOutMin,
            path: path,
            deadline: deadline
        });
        
        // Approve tokens if not swapping ETH
        if (fromToken !== 'ETH') {
            const tokenContract = new ethers.Contract(fromTokenAddress, TOKEN_ABI, signer);
            const allowance = await tokenContract.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.router);
            
            if (allowance.lt(amountInWei)) {
                console.log('Approving tokens...');
                const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.router, amountInWei);
                await approveTx.wait();
                console.log('Tokens approved');
            }
        }
        
        let tx;
        
        // Choose the appropriate swap function based on token types
        if (toToken === 'ETH') {
            // Token to ETH
            tx = await router.swapExactTokensForETH(
                amountInWei,
                amountOutMinWei,
                path,
                await signer.getAddress(),
                deadline
            );
        } else if (fromToken === 'ETH') {
            // ETH to Token
            tx = await router.swapExactETHForTokens(
                amountOutMinWei,
                path,
                await signer.getAddress(),
                deadline,
                { value: amountInWei }
            );
        } else {
            // Token to Token
            tx = await router.swapExactTokensForTokens(
                amountInWei,
                amountOutMinWei,
                path,
                await signer.getAddress(),
                deadline
            );
        }
        
        console.log('Swap transaction:', tx.hash);
        alert('Swap transaction submitted: ' + tx.hash);
        
        // Wait for confirmation
        await tx.wait();
        console.log('Swap completed');
        
        // Reload balances
        await loadTokenBalances();
        
    } catch (error) {
        console.error('Error swapping tokens:', error);
        alert('Swap failed: ' + error.message);
    }
}

// Calculate swap amounts
async function calculateSwapAmounts() {
    try {
        if (!router) {
            console.error('Router not initialized');
            return;
        }
        
        const amountIn = document.getElementById('fromAmount').value;
        if (!amountIn) {
            document.getElementById('toAmount').value = '';
            return;
        }
        
        const fromTokenSelect = document.getElementById('fromToken');
        const toTokenSelect = document.getElementById('toToken');
        
        if (!fromTokenSelect || !toTokenSelect) {
            console.error('Token selectors not found');
            return;
        }
        
        const fromToken = fromTokenSelect.value;
        const toToken = toTokenSelect.value;
        
        // Get token addresses based on selection
        const fromTokenAddress = fromToken === 'TKA' ? CONTRACT_ADDRESSES.tokenA : 
                                fromToken === 'TKB' ? CONTRACT_ADDRESSES.tokenB : 
                                CONTRACT_ADDRESSES.weth;
        const toTokenAddress = toToken === 'TKA' ? CONTRACT_ADDRESSES.tokenA : 
                              toToken === 'TKB' ? CONTRACT_ADDRESSES.tokenB : 
                              CONTRACT_ADDRESSES.weth;
        
        // Don't calculate if same token
        if (fromToken === toToken) {
            document.getElementById('toAmount').value = amountIn;
            return;
        }
        
        const amountInWei = ethers.utils.parseEther(amountIn);
        const path = [fromTokenAddress, toTokenAddress];
        
        const amounts = await router.getAmountsOut(amountInWei, path);
        const amountOut = ethers.utils.formatEther(amounts[1]);
        
        document.getElementById('toAmount').value = amountOut;
        
        // 启用Swap按钮
        const swapBtn = document.getElementById('swapBtn');
        if (swapBtn) {
            swapBtn.disabled = false;
            console.log('Swap button enabled after calculation');
        }
        
        console.log('Swap calculation:', {
            fromToken: fromToken,
            toToken: toToken,
            input: amountIn,
            output: amountOut,
            path: path
        });
        
    } catch (error) {
        console.error('Error calculating swap amounts:', error);
        document.getElementById('toAmount').value = '';
        
        // 禁用Swap按钮
        const swapBtn = document.getElementById('swapBtn');
        if (swapBtn) {
            swapBtn.disabled = true;
            console.log('Swap button disabled due to calculation error');
        }
    }
}

// Add liquidity function
async function addLiquidity() {
    try {
        if (!router || !signer) {
            alert('Please connect wallet first');
            return;
        }
        
        const amountA = document.getElementById('liquidityTokenA').value;
        const amountB = document.getElementById('liquidityTokenB').value;
        
        if (!amountA || !amountB) {
            alert('Please enter liquidity amounts');
            return;
        }
        
        const amountAWei = ethers.utils.parseEther(amountA);
        const amountBWei = ethers.utils.parseEther(amountB);
        const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        
        console.log('Adding liquidity:', {
            amountA: amountA,
            amountB: amountB,
            deadline: deadline
        });
        
        const tx = await router.addLiquidity(
            CONTRACT_ADDRESSES.tokenA,
            CONTRACT_ADDRESSES.tokenB,
            amountAWei,
            amountBWei,
            0, // amountAMin
            0, // amountBMin
            await signer.getAddress(),
            deadline
        );
        
        console.log('Add liquidity transaction:', tx.hash);
        alert('Liquidity transaction submitted: ' + tx.hash);
        
        // Wait for confirmation
        await tx.wait();
        console.log('Liquidity added');
        
        // Reload balances
        await loadTokenBalances();
        
    } catch (error) {
        console.error('Error adding liquidity:', error);
        alert('Add liquidity failed: ' + error.message);
    }
}

// Update MEV configuration
function updateMEVConfig() {
    const protectionDuration = document.getElementById('protectionDuration').value;
    const mevFee = document.getElementById('mevFee').value;
    const minTxSize = document.getElementById('minTxSize').value;
    
    mevConfig = {
        protectionDuration: parseInt(protectionDuration),
        mevFee: parseFloat(mevFee),
        minTxSize: parseFloat(minTxSize)
    };
    
    console.log('MEV config updated:', mevConfig);
    alert('MEV configuration updated');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Update contract addresses
    updateContractAddresses();
    
    // Add event listeners
    const fromAmount = document.getElementById('fromAmount');
    if (fromAmount) {
        fromAmount.addEventListener('input', calculateSwapAmounts);
    }
    
    const mevSwitch = document.getElementById('mevProtectionSwitch');
    if (mevSwitch) {
        mevSwitch.addEventListener('change', toggleMEVProtection);
    }
    
    // Add token selection event listeners
    const fromTokenSelect = document.getElementById('fromToken');
    if (fromTokenSelect) {
        fromTokenSelect.addEventListener('change', updateBalanceDisplay);
    }
    
    const toTokenSelect = document.getElementById('toToken');
    if (toTokenSelect) {
        toTokenSelect.addEventListener('change', updateBalanceDisplay);
    }
    
    console.log('Initialization complete');
});

// Test connection function
async function testConnection() {
    try {
        console.log('Testing connection...');
        
        if (!provider) {
            alert('Please connect wallet first');
            return;
        }
        
        const network = await provider.getNetwork();
        const account = await signer.getAddress();
        
        console.log('Connection test results:', {
            network: network.name,
            chainId: network.chainId,
            account: account
        });
        
        alert(`Connected to ${network.name} (Chain ID: ${network.chainId})\nAccount: ${account}`);
        
    } catch (error) {
        console.error('Connection test failed:', error);
        alert('Connection test failed: ' + error.message);
    }
}

// Switch tokens function - swaps the from and to tokens
function switchTokens() {
    try {
        const fromTokenSelect = document.getElementById('fromToken');
        const toTokenSelect = document.getElementById('toToken');
        const fromAmount = document.getElementById('fromAmount');
        const toAmount = document.getElementById('toAmount');
        
        if (!fromTokenSelect || !toTokenSelect || !fromAmount || !toAmount) {
            console.error('Token selectors not found');
            return;
        }
        
        // Store current values
        const currentFromToken = fromTokenSelect.value;
        const currentToToken = toTokenSelect.value;
        const currentFromAmount = fromAmount.value;
        const currentToAmount = toAmount.value;
        
        // Swap tokens
        fromTokenSelect.value = currentToToken;
        toTokenSelect.value = currentFromToken;
        
        // Swap amounts
        fromAmount.value = currentToAmount;
        toAmount.value = currentFromAmount;
        
        // Update balance display
        updateBalanceDisplay();
        
        // Recalculate swap amounts if there's an input amount
        if (currentToAmount && currentToAmount !== '0') {
            calculateSwapAmounts();
        }
        
        console.log('Tokens switched:', {
            from: currentFromToken + ' → ' + currentToToken,
            to: currentToToken + ' → ' + currentFromToken
        });
        
    } catch (error) {
        console.error('Error switching tokens:', error);
    }
}

console.log('app-final.js loaded successfully');

// ===== ConfigManager Functions =====

// Load current configuration from contract
async function loadCurrentConfig() {
    try {
        if (!provider || !signer) {
            alert('Please connect wallet first');
            return;
        }
        
        if (!CONTRACT_ADDRESSES.configManager) {
            alert('ConfigManager contract address not found. Please deploy the contract first.');
            return;
        }
        
        console.log('Loading current configuration from contract...');
        
        const configManager = new ethers.Contract(
            CONTRACT_ADDRESSES.configManager,
            CONFIG_MANAGER_ABI,
            provider
        );
        
        const config = await configManager.getConfig();
        const isValid = await configManager.isConfigValid();
        const owner = await configManager.owner();
        
        console.log('Current config:', {
            swapFeeRate: config.swapFeeRate.toString(),
            maxSlippage: config.maxSlippage.toString(),
            minLiquidity: config.minLiquidity.toString(),
            isValid: isValid,
            owner: owner
        });
        
        // Update UI with current values
        const swapFeeRateInput = document.getElementById('swapFeeRate');
        const maxSlippageInput = document.getElementById('maxSlippage');
        const minLiquidityInput = document.getElementById('minLiquidity');
        
        if (swapFeeRateInput) {
            swapFeeRateInput.value = (config.swapFeeRate / 100).toFixed(1);
        }
        if (maxSlippageInput) {
            maxSlippageInput.value = (config.maxSlippage / 100).toFixed(1);
        }
        if (minLiquidityInput) {
            minLiquidityInput.value = ethers.utils.formatEther(config.minLiquidity);
        }
        
        // Show success message
        const message = `Configuration loaded successfully!\n\n` +
                       `Swap Fee Rate: ${(config.swapFeeRate / 100).toFixed(1)}%\n` +
                       `Max Slippage: ${(config.maxSlippage / 100).toFixed(1)}%\n` +
                       `Min Liquidity: ${ethers.utils.formatEther(config.minLiquidity)} ETH\n` +
                       `Valid: ${isValid ? 'Yes' : 'No'}\n` +
                       `Owner: ${owner}`;
        
        alert(message);
        
    } catch (error) {
        console.error('Error loading configuration:', error);
        alert('Error loading configuration: ' + error.message);
    }
}

// Update configuration in contract
async function updateConfigManager() {
    try {
        if (!provider || !signer) {
            alert('Please connect wallet first');
            return;
        }
        
        if (!CONTRACT_ADDRESSES.configManager) {
            alert('ConfigManager contract address not found. Please deploy the contract first.');
            return;
        }
        
        // Get values from UI
        const swapFeeRateInput = document.getElementById('swapFeeRate');
        const maxSlippageInput = document.getElementById('maxSlippage');
        const minLiquidityInput = document.getElementById('minLiquidity');
        
        if (!swapFeeRateInput || !maxSlippageInput || !minLiquidityInput) {
            alert('Configuration inputs not found');
            return;
        }
        
        const swapFeeRatePercent = parseFloat(swapFeeRateInput.value);
        const maxSlippagePercent = parseFloat(maxSlippageInput.value);
        const minLiquidityEth = parseFloat(minLiquidityInput.value);
        
        // 移除前端验证 - 合约不做任何检查
        console.log('移除前端验证，允许任何参数值');
        
        // Convert to contract format (basis points and wei)
        const swapFeeRateBps = Math.round(swapFeeRatePercent * 100);
        const maxSlippageBps = Math.round(maxSlippagePercent * 100);
        const minLiquidityWei = ethers.utils.parseEther(minLiquidityEth.toString());
        
        console.log('Updating configuration with values:', {
            swapFeeRateBps: swapFeeRateBps,
            maxSlippageBps: maxSlippageBps,
            minLiquidityWei: minLiquidityWei.toString()
        });
        
        // Create contract instance
        const configManager = new ethers.Contract(
            CONTRACT_ADDRESSES.configManager,
            CONFIG_MANAGER_ABI,
            signer
        );
        
        // 移除权限检查 - 任何人都可以调用
        console.log('任何人都可以调用updateConfig方法');
        
        // Disable button during transaction
        const updateBtn = document.getElementById('updateConfigBtn');
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
        }
        
        // Send transaction
        const tx = await configManager.updateConfig(
            swapFeeRateBps,
            maxSlippageBps,
            minLiquidityWei,
            {
                gasLimit: 300000,
                gasPrice: ethers.utils.parseUnits("2", "gwei")
            }
        );
        
        console.log('Transaction sent:', tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        
        // Re-enable button
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Configuration';
        }
        
        // Show success message
        alert(`Configuration updated successfully!\n\n` +
              `Transaction Hash: ${tx.hash}\n` +
              `Block Number: ${receipt.blockNumber}\n\n` +
              `New Configuration:\n` +
              `- Swap Fee Rate: ${swapFeeRatePercent}%\n` +
              `- Max Slippage: ${maxSlippagePercent}%\n` +
              `- Min Liquidity: ${minLiquidityEth} ETH`);
        
    } catch (error) {
        console.error('Error updating configuration:', error);
        
        // Re-enable button on error
        const updateBtn = document.getElementById('updateConfigBtn');
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Configuration';
        }
        
        alert('Error updating configuration: ' + error.message);
    }
}

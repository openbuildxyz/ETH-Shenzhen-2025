# 🚀 Leafswap Sepolia Deployment Summary

## 📋 Deployment Overview

**Network:** Sepolia Testnet  
**Deployer:** `0xfb35053Bd39dD936f5B430DD5e73E0A6d9B02C85`  
**Deployment Date:** August 18, 2025  
**Status:** ✅ Successfully Deployed

## 📦 Contract Addresses

### Core Contracts
- **SubcriptionConsumer (Chainlink VRF):** `0x5CC1a5329E91Fd5424afd03C42d803DC43904873`
- **MEVGuard:** `0x1527Db198B15099A78209E904aDCcD762EC250E5`
- **LeafswapAMMFactory:** `0x2dABACdbDf93C247E681E3D7E124B61f311D6Fd9`
- **LeafswapRouter:** `0x7d02eD568a1FD8048dc4FDeD9895a40356A47782`

### Test Tokens
- **Token A (TKA):** `0x198921c2Ca38Ee088cF65bFF5327249b1D23409e`
- **Token B (TKB):** `0x0eD732A13D4432EbF0937E5b0F6B64d3DA8F7627`

### External Contracts
- **WETH (Sepolia):** `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`
- **Trading Pair:** Not created yet (due to gas constraints)

## 🔗 Explorer Links

### Core Contracts
- [SubcriptionConsumer](https://sepolia.etherscan.io/address/0x5CC1a5329E91Fd5424afd03C42d803DC43904873)
- [MEVGuard](https://sepolia.etherscan.io/address/0x1527Db198B15099A78209E904aDCcD762EC250E5)
- [LeafswapAMMFactory](https://sepolia.etherscan.io/address/0x2dABACdbDf93C247E681E3D7E124B61f311D6Fd9)
- [LeafswapRouter](https://sepolia.etherscan.io/address/0x7d02eD568a1FD8048dc4FDeD9895a40356A47782)

### Test Tokens
- [Token A (TKA)](https://sepolia.etherscan.io/address/0x198921c2Ca38Ee088cF65bFF5327249b1D23409e)
- [Token B (TKB)](https://sepolia.etherscan.io/address/0x0eD732A13D4432EbF0937E5b0F6B64d3DA8F7627)

## ⚙️ Configuration

### MEV Protection Settings
- **Anti-Front-Running Protection:** 100 blocks
- **MEV Fee Percentage:** 1% (100 basis points)
- **Min Transaction Size:** 0.5% (50 basis points)
- **Swap Fee Rate:** 0.3% (30 basis points)

### Chainlink VRF
- **Subscription ID:** `30867384965334728711427918226381771937390809014305130314753698149523927636152`
- **Network:** Sepolia Testnet

## 💰 Gas Usage & Costs

- **Initial Balance:** 0.233690968826691123 ETH
- **Remaining Balance:** 0.041200868826691123 ETH
- **Total Gas Used:** ~0.192 ETH
- **Average Gas Price:** 20 Gwei

## ✅ Deployment Status

### Completed ✅
- [x] SubcriptionConsumer deployment
- [x] MEVGuard deployment
- [x] LeafswapAMMFactory deployment
- [x] LeafswapRouter deployment
- [x] Test Token A (TKA) deployment
- [x] Test Token B (TKB) deployment
- [x] Factory permissions configuration
- [x] Contract verification

### Pending ⏳
- [ ] Trading pair creation (due to gas constraints)
- [ ] Initial liquidity addition
- [ ] Contract verification on Etherscan

## 🛠️ Next Steps

### Immediate Actions
1. **Create Trading Pair:** Use the factory contract to create the TKA/TKB trading pair
2. **Add Initial Liquidity:** Add initial liquidity to enable trading
3. **Test MEV Protection:** Verify MEV protection features work correctly

### Frontend Integration
1. **Update Configuration:** Frontend config has been updated with Sepolia addresses
2. **Test Wallet Connection:** Ensure MetaMask connects to Sepolia network
3. **Test Token Swapping:** Verify swap functionality works with MEV protection

### Contract Verification
1. **Verify on Etherscan:** Submit contract source code for verification
2. **Update Documentation:** Add verified contract links to documentation

## 🔧 Manual Trading Pair Creation

If you need to create the trading pair manually:

```javascript
// Using the factory contract
const factory = await ethers.getContractAt("LeafswapAMMFactory", "0x2dABACdbDf93C247E681E3D7E124B61f311D6Fd9");
const tx = await factory.createPair(
  "0x198921c2Ca38Ee088cF65bFF5327249b1D23409e", // Token A
  "0x0eD732A13D4432EbF0937E5b0F6B64d3DA8F7627"  // Token B
);
```

## 🧪 Testing

### Test Commands
```bash
# Check balance and network connection
npx hardhat run --network sepolia scripts/check-balance.js

# Create trading pair (if needed)
npx hardhat run --network sepolia scripts/create-pair-sepolia.js

# Run tests
npm test
```

### Test Scenarios
1. **Basic Token Swap:** Test simple token swapping functionality
2. **MEV Protection:** Test MEV protection features
3. **Liquidity Management:** Test adding/removing liquidity
4. **Frontend Integration:** Test complete user flow

## 📞 Support

If you encounter any issues:
1. Check the deployment logs in `deployment-sepolia.json`
2. Verify contract addresses on Etherscan
3. Ensure sufficient ETH balance for gas fees
4. Check network connectivity and RPC endpoint

---

**Deployment completed successfully! 🎉**

Your Leafswap AMM with MEV protection is now live on Sepolia testnet.

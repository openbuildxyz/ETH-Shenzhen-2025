// Leafswap Frontend Configuration
window.LEAFSWAP_CONFIG = {
  // Contract addresses for different networks
  networks: {
    localhost: {
      factory: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      router: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      tokenA: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      tokenB: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      weth: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      mevGuard: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    },
    sepolia: {
      factory: "0x2dABACdbDf93C247E681E3D7E124B61f311D6Fd9",
      router: "0x7d02eD568a1FD8048dc4FDeD9895a40356A47782",
      tokenA: "0x198921c2Ca38Ee088cF65bFF5327249b1D23409e",
      tokenB: "0x0eD732A13D4432EbF0937E5b0F6B64d3DA8F7627",
      weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      mevGuard: "0x1527Db198B15099A78209E904aDCcD762EC250E5",
      subscriptionConsumer: "0x5CC1a5329E91Fd5424afd03C42d803DC43904873",
      configManager: "0x02529cA7b1603Dfa49a6b82622e9a7493C473902"
    }
  },

  // MEV Protection Configuration
  mev: {
    antiFrontDefendBlock: 100,
    antiMEVFeePercentage: 100, // 1%
    antiMEVAmountOutLimitRate: 50, // 0.5%
    swapFeeRate: 30 // 0.3%
  },

  // Network Configuration
  network: {
    sepolia: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/demo",
      explorer: "https://sepolia.etherscan.io",
      nativeCurrency: {
        name: "Sepolia ETH",
        symbol: "ETH",
        decimals: 18
      }
    },
    localhost: {
      chainId: 1337,
      name: "Localhost",
      rpcUrl: "http://127.0.0.1:8545",
      explorer: "http://localhost:8545",
      nativeCurrency: {
        name: "Local ETH",
        symbol: "ETH",
        decimals: 18
      }
    }
  },

  // UI Configuration
  ui: {
    defaultNetwork: "sepolia",
    supportedNetworks: ["sepolia", "localhost"],
    theme: {
      primary: "#28a745",
      secondary: "#6c757d",
      success: "#28a745",
      warning: "#ffc107",
      danger: "#dc3545",
      info: "#17a2b8"
    }
  },

  // Token Configuration
  tokens: {
    TKA: {
      name: "Test Token A",
      symbol: "TKA",
      decimals: 18,
      description: "Test token for Leafswap AMM"
    },
    TKB: {
      name: "Test Token B", 
      symbol: "TKB",
      decimals: 18,
      description: "Test token for Leafswap AMM"
    },
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      description: "Wrapped Ether for Sepolia testnet"
    }
  }
};

console.log("🌿 Leafswap Configuration Loaded:", window.LEAFSWAP_CONFIG);

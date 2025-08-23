# Zama FHE Swap DApp

A decentralized exchange (DEX) application built with Zama's Fully Homomorphic Encryption (FHE) technology, enabling privacy-preserving token swaps and liquidity management.

## Features

- **Private Token Swaps**: Execute token swaps with encrypted amounts using FHE
- **Liquidity Management**: Add and remove liquidity while maintaining privacy
- **Token Minting**: Mint new tokens with encrypted supply
- **Wallet Integration**: Connect with popular Web3 wallets via RainbowKit
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Web3**: Wagmi, Viem, Ethers.js
- **FHE**: Zama Relayer SDK
- **UI Components**: Radix UI, Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd front-zama-swap
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── swap.tsx        # Token swap interface
│   ├── liquidity.tsx   # Liquidity management
│   └── mint.tsx        # Token minting
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   └── fhe/           # FHE encryption/decryption
├── contexts/           # React contexts
└── constants/          # Application constants
```

## FHE Integration

This application leverages Zama's FHE technology to enable:

- Encrypted token amounts in swaps
- Private liquidity calculations
- Confidential token minting operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support, please open an issue in the repository.

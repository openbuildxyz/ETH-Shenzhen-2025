# KUSD Frontend

A modern, dark-themed frontend interface for KUSD DeFi featuring:

- **Dark Gradient Theme**: Beautiful dark color scheme with blue accents
- **Single-Page Scrolling**: Smooth navigation between sections
- **Dashboard Cards**: Interactive card-style components with hover effects
- **Glow Effects**: Hover animations with neon glow effects
- **Parallax Background**: Animated background with floating elements
- **Web3 Integration**: Wallet connection and blockchain interaction
- **Responsive Design**: Mobile-first responsive layout

## Features

### 🎨 UI/UX Features
- Modern dark gradient background with animated orbs
- Card-based dashboard with smooth hover animations
- Glowing buttons and interactive elements
- Parallax scrolling effects
- Smooth animations with Framer Motion
- Mobile-responsive design

### 🔗 Web3 Features
- MetaMask wallet connection
- Multi-chain support (Ethereum, Arbitrum, Optimism, Sepolia)
- Real-time balance display
- Network switching
- Account management

### 📱 Components
- **Header**: Navigation with wallet connection
- **Hero**: Landing section with animated features
- **Dashboard**: Interactive KUSD dashboard
- **Features**: Animated feature showcase
- **Footer**: Links and newsletter signup
- **ParallaxBackground**: Animated background effects

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MetaMask or another Web3 wallet

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend/kusd-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

### Wallet Connection
1. Click the "Connect Wallet" button in the header
2. Select MetaMask (or your preferred wallet)
3. Approve the connection request
4. Your balance and address will be displayed

### Navigation
- Use the header navigation to scroll to different sections
- All navigation is smooth scrolling within the single page
- Mobile users get a hamburger menu

### Dashboard
- View your portfolio overview
- Check current statistics
- Use the mint/redeem interface
- View recent transactions

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations and transitions
- **Ethers.js** - Ethereum blockchain interaction
- **Lucide React** - Icon library
- **CSS Variables** - Theming system

## Color Scheme

The frontend uses a carefully crafted dark theme:

- Primary Background: Dark gradient from black to blue
- Card Background: Translucent dark blue
- Accent Colors: Cyan to blue gradient
- Text: White with blue accents
- Hover Effects: Glowing cyan borders

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

*Note: Web3 features require a browser with MetaMask extension or built-in Web3 support.*

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Landing section
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Features.tsx    # Feature showcase
│   ├── Footer.tsx      # Footer section
│   └── ParallaxBackground.tsx
├── context/            # React contexts
│   └── Web3Context.tsx # Web3 state management
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

### Styling Approach
- CSS-in-JS with styled-jsx
- CSS variables for consistent theming
- Mobile-first responsive design
- Smooth transitions and hover effects

### Web3 Integration
The app uses a custom Web3 context that provides:
- Wallet connection state
- Account information
- Balance tracking
- Network detection
- Transaction capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see the main project LICENSE file for details.
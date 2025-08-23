import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'
import App from './App.tsx'
import WalletProvider from './contexts/walletProvider.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <WalletProvider>
    <BrowserRouter>
      <App />
      <Toaster position='top-center' richColors />
    </BrowserRouter>
  </WalletProvider>
)

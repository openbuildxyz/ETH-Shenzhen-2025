import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { WalletProvider } from './contexts/WalletContext'
import BatchTransaction from './pages/BatchTransaction'
import Dashboard from './pages/Dashboard'
import RecoveryLogic from './pages/RecoveryLogic'
import SubscriptionLogic from './pages/SubscriptionLogic'

const queryClient = new QueryClient()

function App() {
  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/batch-transaction" element={<BatchTransaction />} />
              <Route path="/recovery" element={<RecoveryLogic />} />
              <Route path="/subscription" element={<SubscriptionLogic />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WalletProvider>
  )
}

export default App

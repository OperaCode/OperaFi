import { useAccount } from 'wagmi'
import { LandingPage } from './pages/LandingPage'
import Dashboard       from './pages/Dashboard'

export default function App() {
  const { isConnected } = useAccount()
  return isConnected ? <Dashboard /> : <LandingPage />
}

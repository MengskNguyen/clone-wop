import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebase'
import Home from './pages/Home'
import Login from './pages/Login'
import './App.css'

import { Navigate, Route, Routes } from 'react-router'
import AdminLayout from './layouts/AdminLayout'
import Clients from './pages/Clients'
import AssetVerification from './pages/AssetVerification'
import WithdrawalProcessing from './pages/WithdrawalProcessing'
import AuditLogs from './pages/AuditLogs'
import Loyalty from './pages/Loyalty'
import RewardHistory from './pages/RewardHistory'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthReady(true)
    })

    return unsubscribe
  }, [])

  if (!authReady) {
    return <p className="auth-loading">Đang tải...</p>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        element={
          user
            ? <AdminLayout user={user} />
            : <Navigate to="/login" replace />
        }
      >
        <Route index element={user ? <Home user={user} /> : null} />
        <Route path="clients" element={<Clients />} />
        <Route path="asset-verification" element={<AssetVerification />} />
        <Route path="withdrawal-processing" element={<WithdrawalProcessing />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="loyalty" element={<Loyalty />} />
        <Route path="reward-history" element={<RewardHistory />} />
        <Route
          path="*"
          element={<h2>Không tìm thấy trang</h2>}
        />
      </Route>
    </Routes>
  )
}

export default App

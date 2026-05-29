import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/RouteGuards'
import Navbar from './components/Navbar'
import CompanyPage from './pages/CompanyPage'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BuyPage from './pages/BuyPage'
import SellPage from './pages/SellPage'

function Shell() {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/companies/:ticker" element={<CompanyPage />} />
        <Route
          path="/portfolio/buy"
          element={
            <ProtectedRoute>
              <BuyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio/sell"
          element={
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  )
}

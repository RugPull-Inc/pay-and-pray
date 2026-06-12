import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/RouteGuards'
import Navbar from './components/Navbar'
import PortfolioLayout from './layouts/PortfolioLayout'
import CompanyPage from './pages/CompanyPage'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BuyPage from './pages/BuyPage'
import SellPage from './pages/SellPage'
import PortfolioHistoryPage from './pages/PortfolioHistoryPage'
import PortfolioPage from './pages/PortfolioPage'

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
          path="/portfolio"
          element={
            <ProtectedRoute>
              <PortfolioLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PortfolioPage />} />
          <Route path="buy" element={<BuyPage />} />
          <Route path="sell" element={<SellPage />} />
          <Route path="history" element={<PortfolioHistoryPage />} />
        </Route>
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

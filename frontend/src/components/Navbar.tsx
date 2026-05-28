import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/src/auth/AuthContext'

function TradeMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function handleBlur(e: React.FocusEvent) {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false)
  }

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
      >
        Trade tickers
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
          <Link
            to="/portfolio/buy"
            onClick={() => setOpen(false)}
            className="flex justify-center px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Buy
          </Link>
          <Link
            to="/portfolio/sell"
            onClick={() => setOpen(false)}
            className="flex justify-center px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
          >
            Sell
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isAuthenticated, signOut } = useAuth()

  function handleLogout() {
    signOut()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50">
      <Link
        to="/"
        className="text-sm font-semibold text-zinc-100 tracking-tight hover:text-indigo-400 transition-colors"
      >
        Pay & Pray
      </Link>
      {isAuthenticated ? (
        <div className="flex gap-2">
          <TradeMenu />
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          {pathname !== '/login' && (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          )}
          {pathname !== '/register' && (
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
            >
              Register
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

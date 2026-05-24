import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/src/auth/AuthContext'

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
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
        >
          Sign out
        </button>
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

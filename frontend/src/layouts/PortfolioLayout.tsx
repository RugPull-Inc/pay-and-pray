import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/portfolio', label: 'Mi Portfolio', end: true },
  { to: '/portfolio/buy', label: 'Buy' },
  { to: '/portfolio/sell', label: 'Sell' },
  { to: '/portfolio/history', label: 'Historial' },
]

export default function PortfolioLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <nav
          className="flex gap-1 border-b border-zinc-800"
          data-testid="portfolio-tabs"
        >
          {tabs.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Search } from 'lucide-react'

const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA']

const MOCK_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'UNH', name: 'UnitedHealth Group Inc.' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation' },
  { ticker: 'JNJ', name: 'Johnson & Johnson' },
  { ticker: 'WMT', name: 'Walmart Inc.' },
  { ticker: 'MA', name: 'Mastercard Inc.' },
  { ticker: 'PG', name: 'Procter & Gamble Co.' },
  { ticker: 'HD', name: 'The Home Depot Inc.' },
  { ticker: 'CVX', name: 'Chevron Corporation' },
  { ticker: 'ABBV', name: 'AbbVie Inc.' },
  { ticker: 'KO', name: 'The Coca-Cola Company' },
]

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return []
    return MOCK_COMPANIES.filter(
      (c) => c.ticker.includes(q) || c.name.toUpperCase().includes(q)
    ).slice(0, 6)
  }, [query])

  const showEmpty = query.trim().length > 0 && results.length === 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-indigo-500/10 rounded-3xl">
              <TrendingUp size={40} className="text-indigo-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Pay & Pray</h1>
          <p className="text-zinc-400 text-lg">
            Financial metrics & SEC filings for any US-listed company
          </p>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or company name..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-colors font-mono tracking-wide"
            />
          </div>

          {results.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
              {results.map((c) => (
                <button
                  key={c.ticker}
                  onClick={() => router.push(`/companies/${c.ticker}`)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
                >
                  <span className="font-mono text-sm font-semibold text-indigo-400 w-16 shrink-0">{c.ticker}</span>
                  <span className="text-sm text-zinc-300 truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-zinc-500">No companies found for <span className="text-zinc-300 font-mono">"{query.trim()}"</span></p>
            </div>
          )}
        </div>

        {!query.trim() && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider text-center">Popular</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR.map((t) => (
                <Link
                  key={t}
                  href={`/companies/${t}`}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 rounded-full text-sm font-mono text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

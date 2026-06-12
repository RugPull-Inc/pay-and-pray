import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Search, Loader2 } from 'lucide-react'
import { searchCompanies } from '@/src/services/companyService'
import type { BackendSearchResult } from '@/src/services/companyService'

const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA']

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<BackendSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const trimmed = query.trim()
  const results = trimmed ? hits : []
  const searched = trimmed ? hasSearched : false

  const runSearch = useCallback(async (q: string) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const data = await searchCompanies(q)
      setHits(data)
    } catch {
      setHits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!trimmed) return
    const id = setTimeout(() => runSearch(trimmed), 350)
    return () => clearTimeout(id)
  }, [trimmed, runSearch])

  const showEmpty = searched && !loading && results.length === 0

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
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or company name..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-colors font-mono tracking-wide"
            />
            {loading && (
              <Loader2
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin"
              />
            )}
          </div>

          {results.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
              {results.slice(0, 6).map((c) => (
                <button
                  key={c.cik ?? c.name}
                  onClick={() => navigate(`/companies/${c.ticker ?? c.cik}`)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
                >
                  <span className="font-mono text-sm font-semibold text-indigo-400 w-16 shrink-0">
                    {c.ticker ?? '-'}
                  </span>
                  <span className="text-sm text-zinc-300 truncate">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-zinc-500">
                No companies found for{' '}
                <span className="text-zinc-300 font-mono">
                  &ldquo;{query.trim()}&rdquo;
                </span>
              </p>
            </div>
          )}
        </div>

        {!query.trim() && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider text-center">
              Popular
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR.map((t) => (
                <Link
                  key={t}
                  to={`/companies/${t}`}
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

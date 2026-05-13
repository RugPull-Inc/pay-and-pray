'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Search, ArrowRight } from 'lucide-react'

const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA']

export default function Home() {
  const router = useRouter()
  const [ticker, setTicker] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const t = ticker.trim().toUpperCase()
    if (t) router.push(`/companies/${t}`)
  }

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

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Search ticker (e.g. AAPL)"
              maxLength={10}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-colors font-mono tracking-wide"
            />
          </div>
          <button
            type="submit"
            disabled={!ticker.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
          >
            Search
            <ArrowRight size={15} />
          </button>
        </form>

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
      </div>
    </div>
  )
}

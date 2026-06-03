import { useRef, useState } from 'react'

interface TickerSuggestion {
  ticker: string
  name: string
}

const MOCK_TICKERS: TickerSuggestion[] = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'BRK', name: 'Berkshire Hathaway Inc.' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'V', name: 'Visa Inc.' },
]

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function TickerInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const suggestions = value.trim()
    ? MOCK_TICKERS.filter(
        (t) =>
          t.ticker.startsWith(value.toUpperCase()) ||
          t.name.toLowerCase().includes(value.toLowerCase())
      )
    : []

  function handleBlur(e: React.FocusEvent) {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false)
  }

  function select(ticker: string) {
    onChange(ticker)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <input
        id="ticker"
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase())
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="AAPL"
        autoComplete="off"
        className="w-full rounded-xl border border-zinc-700 px-3.5 py-3 text-sm text-zinc-100 bg-zinc-900 outline-none transition focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 font-mono"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
          {suggestions.map((s) => (
            <li key={s.ticker}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(s.ticker)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-800 transition-colors text-left"
              >
                <span className="text-sm font-mono font-semibold text-indigo-300 w-14 shrink-0">
                  {s.ticker}
                </span>
                <span className="text-sm text-zinc-400 truncate">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

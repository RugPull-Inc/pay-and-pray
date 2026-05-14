'use client'

import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function CompanyError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="p-5 bg-zinc-900 rounded-2xl">
            <AlertCircle size={40} className="text-red-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-100">
            Something went wrong
          </h1>
          <p className="text-zinc-400 text-sm">
            Failed to load company data. Try again or go back to search.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowLeft size={14} />
            Back to search
          </Link>
        </div>
      </div>
    </div>
  )
}

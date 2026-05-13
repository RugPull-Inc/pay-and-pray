import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function CompanyNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="p-5 bg-zinc-900 rounded-2xl">
            <SearchX size={40} className="text-zinc-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-100">Company not found</h1>
          <p className="text-zinc-400 text-sm">
            No data available for that ticker. Check the symbol and try again.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowLeft size={14} />
          Back to search
        </Link>
      </div>
    </div>
  )
}

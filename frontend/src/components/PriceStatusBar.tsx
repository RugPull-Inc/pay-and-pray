import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getAuthToken } from '@/src/auth/tokenCookie'
import { getPriceStatusText, getLastUpdated } from '@/src/services/priceService'

export default function PriceStatusBar() {
  const [lastUpdated, setLastUpdated] = useState<string | null | undefined>(
    undefined
  )

  useEffect(() => {
    if (!getAuthToken()) return
    getLastUpdated()
      .then((res) => setLastUpdated(res.lastUpdated))
      .catch(() => setLastUpdated(undefined))
  }, [])

  if (lastUpdated === undefined) return null

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
      <Clock size={12} />
      {getPriceStatusText(lastUpdated)}
    </div>
  )
}

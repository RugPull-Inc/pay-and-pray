import { useEffect, useState } from 'react'
import {
  formatOperationDate,
  formatOperationPrice,
  getPortfolioHistory,
  PortfolioOperation,
} from '@/src/services/portfolioHistoryService'

export default function PortfolioHistoryPage() {
  const [operations, setOperations] = useState<PortfolioOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPortfolioHistory()
      .then(setOperations)
      .catch(() => setError('No se pudo cargar el historial.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-zinc-400 text-sm">Cargando...</p>
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>
  }

  if (operations.length === 0) {
    return (
      <p className="text-zinc-400 text-sm">No tenés operaciones registradas.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 pr-6 text-zinc-400 font-medium">
              Fecha
            </th>
            <th className="text-left py-3 pr-6 text-zinc-400 font-medium">
              Ticker
            </th>
            <th className="text-left py-3 pr-6 text-zinc-400 font-medium">
              Tipo
            </th>
            <th className="text-right py-3 pr-6 text-zinc-400 font-medium">
              Cantidad
            </th>
            <th className="text-right py-3 text-zinc-400 font-medium">
              Precio
            </th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op) => (
            <tr key={op.id} className="border-b border-zinc-800/50">
              <td className="py-3 pr-6 text-zinc-300">
                {formatOperationDate(op.createdAt)}
              </td>
              <td className="py-3 pr-6 font-medium">{op.ticker}</td>
              <td className="py-3 pr-6">
                {op.type === 'BUY' ? (
                  <span className="buy-badge inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    BUY
                  </span>
                ) : (
                  <span className="sell-badge inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    SELL
                  </span>
                )}
              </td>
              <td className="py-3 pr-6 text-right text-zinc-300">
                {op.quantity}
              </td>
              <td className="py-3 text-right text-zinc-300">
                {formatOperationPrice(op.priceAtOperation)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

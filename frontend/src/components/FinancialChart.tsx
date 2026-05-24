import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { QuarterlySnapshot } from '@/src/types/company'

interface Props {
  history: QuarterlySnapshot[]
}

function formatBillions(value: number) {
  return `$${(value / 1e9).toFixed(1)}B`
}

function formatEPS(value: number) {
  return `$${value.toFixed(2)}`
}

export default function FinancialChart({ history }: Props) {
  const data = [...history].reverse().map((q) => ({
    period: `${q.fiscalPeriod} FY${q.fiscalYear}`,
    Revenue: q.revenue,
    'Net Income': q.netIncome,
    EPS: q.eps,
  }))

  const hasRevenue = data.some((d) => d.Revenue !== null)
  const hasNetIncome = data.some((d) => d['Net Income'] !== null)

  if (!hasRevenue && !hasNetIncome) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
        No quarterly data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-zinc-800)" />
        <XAxis
          dataKey="period"
          tick={{ fill: 'var(--color-zinc-400)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`}
          tick={{ fill: 'var(--color-zinc-400)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value, name) => {
            const num = typeof value === 'number' ? value : 0
            return [
              name === 'EPS' ? formatEPS(num) : formatBillions(num),
              String(name),
            ]
          }}
          contentStyle={{
            background: 'var(--color-zinc-900)',
            border: '1px solid var(--color-zinc-700)',
            borderRadius: 8,
            color: 'var(--color-zinc-100)',
          }}
          labelStyle={{ color: 'var(--color-zinc-400)', marginBottom: 4 }}
        />
        <Legend
          wrapperStyle={{
            color: 'var(--color-zinc-400)',
            fontSize: 13,
            paddingTop: 12,
          }}
        />
        {hasRevenue && (
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="var(--color-indigo-500)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--color-indigo-500)' }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        )}
        {hasNetIncome && (
          <Line
            type="monotone"
            dataKey="Net Income"
            stroke="var(--color-emerald-500)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--color-emerald-500)' }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

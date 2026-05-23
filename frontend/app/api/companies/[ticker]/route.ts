import type { NextRequest } from 'next/server'
import { fetchCompanyData } from '@/lib/company-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const data = await fetchCompanyData(ticker)
  if (!data) return new Response(null, { status: 404 })
  return Response.json(data)
}

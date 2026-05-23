import type { Metadata } from 'next'
import CompanyDetailClient from './components/CompanyDetailClient'

type Props = { params: Promise<{ ticker: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  return {
    title: `${ticker.toUpperCase()} — Pay & Pray`,
  }
}

export default async function CompanyPage({ params }: Props) {
  const { ticker } = await params
  return <CompanyDetailClient ticker={ticker.toUpperCase()} />
}

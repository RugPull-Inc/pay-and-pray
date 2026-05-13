import type { CompanyFinancialsResponse } from '@/app/types/company'

const MOCK: Record<string, CompanyFinancialsResponse> = {
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    cik: '320193',
    isMock: true,
    metrics: {
      revenue:          { value: 124300000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      netIncome:        { value:  36330000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      eps:              { value:          2.40, unit: 'USD/share', period: '2025-Q1', form: 'quarterly' },
      totalAssets:      { value: 364980000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      totalLiabilities: { value: 308030000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
    },
    quarterlyHistory: [
      { period:'2025-Q1', fiscalYear:2025, fiscalPeriod:'Q1', revenue:124300000000, netIncome:36330000000, eps:2.40, totalAssets:364980000000, totalLiabilities:308030000000 },
      { period:'2024-Q4', fiscalYear:2024, fiscalPeriod:'Q4', revenue: 94930000000, netIncome:14736000000, eps:0.97, totalAssets:353514000000, totalLiabilities:294350000000 },
      { period:'2024-Q3', fiscalYear:2024, fiscalPeriod:'Q3', revenue: 85777000000, netIncome:21448000000, eps:1.40, totalAssets:331610000000, totalLiabilities:279032000000 },
      { period:'2024-Q2', fiscalYear:2024, fiscalPeriod:'Q2', revenue: 90753000000, netIncome:23636000000, eps:1.53, totalAssets:337411000000, totalLiabilities:279032000000 },
      { period:'2024-Q1', fiscalYear:2024, fiscalPeriod:'Q1', revenue:119575000000, netIncome:33916000000, eps:2.18, totalAssets:353514000000, totalLiabilities:290437000000 },
      { period:'2023-Q4', fiscalYear:2023, fiscalPeriod:'Q4', revenue: 89498000000, netIncome:22956000000, eps:1.46, totalAssets:352583000000, totalLiabilities:290437000000 },
      { period:'2023-Q3', fiscalYear:2023, fiscalPeriod:'Q3', revenue: 81797000000, netIncome:19881000000, eps:1.26, totalAssets:335038000000, totalLiabilities:274764000000 },
      { period:'2023-Q2', fiscalYear:2023, fiscalPeriod:'Q2', revenue: 94836000000, netIncome:24160000000, eps:1.52, totalAssets:332160000000, totalLiabilities:269612000000 },
    ],
    recentFilings: [
      { type:'10-Q', filedDate:'2025-02-06', reportDate:'2024-12-28', accessionNumber:'0000320193-25-000008', primaryDocument:'aapl-20241228.htm', url:'https://www.sec.gov/Archives/edgar/data/320193/000032019325000008/aapl-20241228.htm' },
      { type:'10-K', filedDate:'2024-11-01', reportDate:'2024-09-28', accessionNumber:'0000320193-24-000123', primaryDocument:'aapl-20240928.htm', url:'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm' },
      { type:'10-Q', filedDate:'2024-08-02', reportDate:'2024-06-29', accessionNumber:'0000320193-24-000085', primaryDocument:'aapl-20240629.htm', url:'https://www.sec.gov/Archives/edgar/data/320193/000032019324000085/aapl-20240629.htm' },
      { type:'10-Q', filedDate:'2024-05-03', reportDate:'2024-03-30', accessionNumber:'0000320193-24-000052', primaryDocument:'aapl-20240330.htm', url:'https://www.sec.gov/Archives/edgar/data/320193/000032019324000052/aapl-20240330.htm' },
      { type:'10-Q', filedDate:'2024-02-02', reportDate:'2023-12-30', accessionNumber:'0000320193-24-000006', primaryDocument:'aapl-20231230.htm', url:'https://www.sec.gov/Archives/edgar/data/320193/000032019324000006/aapl-20231230.htm' },
    ],
  },
  MSFT: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    cik: '789019',
    isMock: true,
    metrics: {
      revenue:          { value:  70066000000, unit: 'USD',       period: '2025-Q2', form: 'quarterly' },
      netIncome:        { value:  24108000000, unit: 'USD',       period: '2025-Q2', form: 'quarterly' },
      eps:              { value:          3.23, unit: 'USD/share', period: '2025-Q2', form: 'quarterly' },
      totalAssets:      { value: 512641000000, unit: 'USD',       period: '2025-Q2', form: 'quarterly' },
      totalLiabilities: { value: 243704000000, unit: 'USD',       period: '2025-Q2', form: 'quarterly' },
    },
    quarterlyHistory: [
      { period:'2025-Q2', fiscalYear:2025, fiscalPeriod:'Q2', revenue:70066000000, netIncome:24108000000, eps:3.23, totalAssets:512641000000, totalLiabilities:243704000000 },
      { period:'2025-Q1', fiscalYear:2025, fiscalPeriod:'Q1', revenue:65585000000, netIncome:24667000000, eps:3.30, totalAssets:523013000000, totalLiabilities:250041000000 },
      { period:'2024-Q4', fiscalYear:2024, fiscalPeriod:'Q4', revenue:64727000000, netIncome:22036000000, eps:2.95, totalAssets:512641000000, totalLiabilities:243704000000 },
      { period:'2024-Q3', fiscalYear:2024, fiscalPeriod:'Q3', revenue:61858000000, netIncome:21939000000, eps:2.94, totalAssets:484275000000, totalLiabilities:229736000000 },
      { period:'2024-Q2', fiscalYear:2024, fiscalPeriod:'Q2', revenue:62020000000, netIncome:21939000000, eps:2.93, totalAssets:484275000000, totalLiabilities:229736000000 },
      { period:'2024-Q1', fiscalYear:2024, fiscalPeriod:'Q1', revenue:56517000000, netIncome:20081000000, eps:2.69, totalAssets:484275000000, totalLiabilities:229736000000 },
      { period:'2023-Q4', fiscalYear:2023, fiscalPeriod:'Q4', revenue:56189000000, netIncome:20081000000, eps:2.69, totalAssets:411976000000, totalLiabilities:198298000000 },
      { period:'2023-Q3', fiscalYear:2023, fiscalPeriod:'Q3', revenue:52857000000, netIncome:18299000000, eps:2.45, totalAssets:411976000000, totalLiabilities:198298000000 },
    ],
    recentFilings: [
      { type:'10-Q', filedDate:'2025-01-29', reportDate:'2024-12-31', accessionNumber:'0000789019-25-000003', primaryDocument:'msft-20241231.htm', url:'https://www.sec.gov/Archives/edgar/data/789019/000078901925000003/msft-20241231.htm' },
      { type:'10-K', filedDate:'2024-07-30', reportDate:'2024-06-30', accessionNumber:'0000789019-24-000070', primaryDocument:'msft-20240630.htm', url:'https://www.sec.gov/Archives/edgar/data/789019/000078901924000070/msft-20240630.htm' },
    ],
  },
  GOOGL: {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    cik: '1652044',
    isMock: true,
    metrics: {
      revenue:          { value:  96469000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      netIncome:        { value:  34540000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      eps:              { value:          2.81, unit: 'USD/share', period: '2025-Q1', form: 'quarterly' },
      totalAssets:      { value: 450256000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      totalLiabilities: { value: 119863000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
    },
    quarterlyHistory: [
      { period:'2025-Q1', fiscalYear:2025, fiscalPeriod:'Q1', revenue: 96469000000, netIncome:34540000000, eps:2.81, totalAssets:450256000000, totalLiabilities:119863000000 },
      { period:'2024-Q4', fiscalYear:2024, fiscalPeriod:'Q4', revenue: 96469000000, netIncome:26541000000, eps:2.15, totalAssets:450256000000, totalLiabilities:119863000000 },
      { period:'2024-Q3', fiscalYear:2024, fiscalPeriod:'Q3', revenue: 88268000000, netIncome:26301000000, eps:2.12, totalAssets:430266000000, totalLiabilities:114219000000 },
      { period:'2024-Q2', fiscalYear:2024, fiscalPeriod:'Q2', revenue: 84742000000, netIncome:23619000000, eps:1.89, totalAssets:421122000000, totalLiabilities:110649000000 },
      { period:'2024-Q1', fiscalYear:2024, fiscalPeriod:'Q1', revenue: 80539000000, netIncome:23662000000, eps:1.89, totalAssets:402392000000, totalLiabilities:107633000000 },
      { period:'2023-Q4', fiscalYear:2023, fiscalPeriod:'Q4', revenue: 86310000000, netIncome:20402000000, eps:1.64, totalAssets:402392000000, totalLiabilities:107633000000 },
      { period:'2023-Q3', fiscalYear:2023, fiscalPeriod:'Q3', revenue: 76693000000, netIncome:19689000000, eps:1.55, totalAssets:369864000000, totalLiabilities: 97072000000 },
      { period:'2023-Q2', fiscalYear:2023, fiscalPeriod:'Q2', revenue: 74599000000, netIncome:18368000000, eps:1.44, totalAssets:359268000000, totalLiabilities: 93522000000 },
    ],
    recentFilings: [
      { type:'10-Q', filedDate:'2025-04-29', reportDate:'2025-03-31', accessionNumber:'0001652044-25-000027', primaryDocument:'goog-20250331.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1652044&type=10-Q' },
      { type:'10-K', filedDate:'2025-02-04', reportDate:'2024-12-31', accessionNumber:'0001652044-25-000010', primaryDocument:'goog-20241231.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1652044&type=10-K' },
    ],
  },
  AMZN: {
    ticker: 'AMZN',
    companyName: 'Amazon.com, Inc.',
    cik: '1018724',
    isMock: true,
    metrics: {
      revenue:          { value: 187787000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      netIncome:        { value:  17127000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      eps:              { value:          1.59, unit: 'USD/share', period: '2025-Q1', form: 'quarterly' },
      totalAssets:      { value: 624894000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      totalLiabilities: { value: 389740000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
    },
    quarterlyHistory: [
      { period:'2025-Q1', fiscalYear:2025, fiscalPeriod:'Q1', revenue:187787000000, netIncome:17127000000, eps:1.59, totalAssets:624894000000, totalLiabilities:389740000000 },
      { period:'2024-Q4', fiscalYear:2024, fiscalPeriod:'Q4', revenue:187791000000, netIncome:20004000000, eps:1.86, totalAssets:624894000000, totalLiabilities:389740000000 },
      { period:'2024-Q3', fiscalYear:2024, fiscalPeriod:'Q3', revenue:158877000000, netIncome:15328000000, eps:1.43, totalAssets:584101000000, totalLiabilities:365522000000 },
      { period:'2024-Q2', fiscalYear:2024, fiscalPeriod:'Q2', revenue:148008000000, netIncome:13485000000, eps:1.26, totalAssets:554953000000, totalLiabilities:348996000000 },
      { period:'2024-Q1', fiscalYear:2024, fiscalPeriod:'Q1', revenue:143313000000, netIncome:10431000000, eps:0.98, totalAssets:522437000000, totalLiabilities:329543000000 },
      { period:'2023-Q4', fiscalYear:2023, fiscalPeriod:'Q4', revenue:169961000000, netIncome:10624000000, eps:1.00, totalAssets:527854000000, totalLiabilities:333849000000 },
      { period:'2023-Q3', fiscalYear:2023, fiscalPeriod:'Q3', revenue:143083000000, netIncome: 9879000000, eps:0.94, totalAssets:481881000000, totalLiabilities:305946000000 },
      { period:'2023-Q2', fiscalYear:2023, fiscalPeriod:'Q2', revenue:134383000000, netIncome: 6750000000, eps:0.65, totalAssets:462675000000, totalLiabilities:302292000000 },
    ],
    recentFilings: [
      { type:'10-Q', filedDate:'2025-05-01', reportDate:'2025-03-31', accessionNumber:'0001018724-25-000012', primaryDocument:'amzn-20250331.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1018724&type=10-Q' },
      { type:'10-K', filedDate:'2025-02-06', reportDate:'2024-12-31', accessionNumber:'0001018724-25-000004', primaryDocument:'amzn-20241231.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1018724&type=10-K' },
    ],
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    cik: '1318605',
    isMock: true,
    metrics: {
      revenue:          { value: 19335000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      netIncome:        { value:   409000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      eps:              { value:         0.12, unit: 'USD/share', period: '2025-Q1', form: 'quarterly' },
      totalAssets:      { value: 99955000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
      totalLiabilities: { value: 45297000000, unit: 'USD',       period: '2025-Q1', form: 'quarterly' },
    },
    quarterlyHistory: [
      { period:'2025-Q1', fiscalYear:2025, fiscalPeriod:'Q1', revenue:19335000000, netIncome:  409000000, eps:0.12, totalAssets: 99955000000, totalLiabilities:45297000000 },
      { period:'2024-Q4', fiscalYear:2024, fiscalPeriod:'Q4', revenue:25707000000, netIncome: 2327000000, eps:0.73, totalAssets:106618000000, totalLiabilities:47750000000 },
      { period:'2024-Q3', fiscalYear:2024, fiscalPeriod:'Q3', revenue:25182000000, netIncome: 2167000000, eps:0.68, totalAssets:104765000000, totalLiabilities:43668000000 },
      { period:'2024-Q2', fiscalYear:2024, fiscalPeriod:'Q2', revenue:25182000000, netIncome: 1478000000, eps:0.46, totalAssets:107039000000, totalLiabilities:45064000000 },
      { period:'2024-Q1', fiscalYear:2024, fiscalPeriod:'Q1', revenue:21301000000, netIncome: 1129000000, eps:0.34, totalAssets:109226000000, totalLiabilities:48662000000 },
      { period:'2023-Q4', fiscalYear:2023, fiscalPeriod:'Q4', revenue:25167000000, netIncome: 7928000000, eps:2.27, totalAssets:106618000000, totalLiabilities:43009000000 },
      { period:'2023-Q3', fiscalYear:2023, fiscalPeriod:'Q3', revenue:23350000000, netIncome: 1853000000, eps:0.53, totalAssets: 93941000000, totalLiabilities:38413000000 },
      { period:'2023-Q2', fiscalYear:2023, fiscalPeriod:'Q2', revenue:24927000000, netIncome: 2703000000, eps:0.78, totalAssets: 90591000000, totalLiabilities:35989000000 },
    ],
    recentFilings: [
      { type:'10-Q', filedDate:'2025-04-22', reportDate:'2025-03-31', accessionNumber:'0001318605-25-000018', primaryDocument:'tsla-20250331.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1318605&type=10-Q' },
      { type:'10-K', filedDate:'2025-01-29', reportDate:'2024-12-31', accessionNumber:'0001318605-25-000008', primaryDocument:'tsla-20241231.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1318605&type=10-K' },
    ],
  },
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    cik: '1045810',
    isMock: true,
    metrics: {
      revenue:          { value:  44062000000, unit: 'USD',       period: '2025-Q4', form: 'quarterly' },
      netIncome:        { value:  22091000000, unit: 'USD',       period: '2025-Q4', form: 'quarterly' },
      eps:              { value:          0.89, unit: 'USD/share', period: '2025-Q4', form: 'quarterly' },
      totalAssets:      { value: 111601000000, unit: 'USD',       period: '2025-Q4', form: 'quarterly' },
      totalLiabilities: { value:  30028000000, unit: 'USD',       period: '2025-Q4', form: 'quarterly' },
    },
    quarterlyHistory: [
      { period:'2025-Q4', fiscalYear:2025, fiscalPeriod:'Q4', revenue:44062000000, netIncome:22091000000, eps:0.89, totalAssets:111601000000, totalLiabilities:30028000000 },
      { period:'2025-Q3', fiscalYear:2025, fiscalPeriod:'Q3', revenue:35082000000, netIncome:19309000000, eps:0.78, totalAssets: 96013000000, totalLiabilities:27051000000 },
      { period:'2025-Q2', fiscalYear:2025, fiscalPeriod:'Q2', revenue:30040000000, netIncome:16599000000, eps:0.67, totalAssets: 85227000000, totalLiabilities:27227000000 },
      { period:'2025-Q1', fiscalYear:2025, fiscalPeriod:'Q1', revenue:26044000000, netIncome:14881000000, eps:0.60, totalAssets: 82658000000, totalLiabilities:27017000000 },
      { period:'2024-Q4', fiscalYear:2024, fiscalPeriod:'Q4', revenue:22103000000, netIncome:12285000000, eps:0.49, totalAssets: 65728000000, totalLiabilities:22057000000 },
      { period:'2024-Q3', fiscalYear:2024, fiscalPeriod:'Q3', revenue:18120000000, netIncome: 9243000000, eps:0.37, totalAssets: 58158000000, totalLiabilities:19281000000 },
      { period:'2024-Q2', fiscalYear:2024, fiscalPeriod:'Q2', revenue:13507000000, netIncome: 6188000000, eps:0.25, totalAssets: 42984000000, totalLiabilities:11865000000 },
      { period:'2024-Q1', fiscalYear:2024, fiscalPeriod:'Q1', revenue: 7192000000, netIncome: 1414000000, eps:0.06, totalAssets: 28791000000, totalLiabilities: 7670000000 },
    ],
    recentFilings: [
      { type:'10-K', filedDate:'2025-02-26', reportDate:'2025-01-26', accessionNumber:'0001045810-25-000038', primaryDocument:'nvda-20250126.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1045810&type=10-K' },
      { type:'10-Q', filedDate:'2024-11-21', reportDate:'2024-10-27', accessionNumber:'0001045810-24-000107', primaryDocument:'nvda-20241027.htm', url:'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1045810&type=10-Q' },
    ],
  },
}

const KNOWN_TICKERS = new Set(Object.keys(MOCK))

export async function fetchCompanyData(ticker: string): Promise<CompanyFinancialsResponse | null> {
  const upper = ticker.toUpperCase()

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
  try {
    const res = await fetch(`${backendUrl}/api/companies/${upper}/financials`, {
      next: { revalidate: 300 },
    })
    if (res.ok) return res.json() as Promise<CompanyFinancialsResponse>
  } catch {
    // backend not available — fall through to mock
  }

  if (KNOWN_TICKERS.has(upper)) return MOCK[upper]

  return null
}

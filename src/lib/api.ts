const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/l123wx/gold/master/data'

export async function fetchYearlyData(year: string) {
  const response = await fetch(`${GITHUB_RAW_BASE}/yearly/${year}.json`)
  if (!response.ok) throw new Error('Failed to fetch yearly data')
  return response.json()
}

export async function fetchDailyData(date: string) {
  const [year, month, day] = date.split('-')
  const response = await fetch(`${GITHUB_RAW_BASE}/${year}/${month}/${day}.json`)
  if (!response.ok) throw new Error('Failed to fetch daily data')
  return response.json()
}

export async function fetchLatestPrice(date: string) {
  const [year, month, day] = date.split('-')
  const response = await fetch(`${GITHUB_RAW_BASE}/${year}/${month}/${day}-latest.json`)
  if (!response.ok) throw new Error('Failed to fetch latest price')
  return response.json()
}

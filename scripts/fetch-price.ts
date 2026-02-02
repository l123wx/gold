import fs from 'node:fs'
import path from 'node:path'

const API_BASE = 'https://ms.jr.jd.com/gw/generic/hj/h5/m'

async function fetchAPI(endpoint: string, body?: object) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  console.log(`Written: ${filePath}`)
}

async function main() {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')

  // 获取当天金价走势
  console.log('Fetching today prices...')
  const todayPrices = await fetchAPI('todayPrices')
  writeJSON(`data/${year}/${month}/${day}.json`, todayPrices)

  // 获取最新金价
  console.log('Fetching latest price...')
  const latestPrice = await fetchAPI('latestPrice')
  writeJSON(`data/${year}/${month}/${day}-latest.json`, latestPrice)

  // 获取年度历史数据
  console.log('Fetching history prices...')
  const historyPrices = await fetchAPI('historyPrices', { reqData: { period: 'y' } })
  writeJSON(`data/yearly/${year}.json`, historyPrices)

  console.log('Done!')
}

main().catch(console.error)

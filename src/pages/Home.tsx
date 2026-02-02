import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import dayjs from 'dayjs'
import { useYearlyData } from '../hooks/useGoldPrice'
import { PriceChart } from '../components/PriceChart'

export default function Home() {
  const navigate = useNavigate()
  const year = dayjs().format('YYYY')
  const { data, loading, error } = useYearlyData(year)

  const handlePointClick = (date: string) => {
    navigate(`/day/${date}`)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    if (date) {
      navigate(`/day/${date}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">加载失败: {error.message}</p>
      </div>
    )
  }

  const chartData = data?.resultData?.datas || []
  const latestPoint = chartData[chartData.length - 1]
  const prevPoint = chartData[chartData.length - 2]
  const latestPrice = latestPoint ? parseFloat(latestPoint.value[1]) : 0
  const prevPrice = prevPoint ? parseFloat(prevPoint.value[1]) : 0
  const change = latestPrice - prevPrice
  const changeRate = prevPrice ? ((change / prevPrice) * 100).toFixed(2) : '0'
  const isUp = change >= 0

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">金价信息</h1>
        <p className="text-muted-foreground">每日金价走势记录</p>
      </header>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">¥{latestPrice.toFixed(2)}</span>
          <span className={`flex items-center gap-1 ${isUp ? 'text-red-500' : 'text-green-500'}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changeRate}%)
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {latestPoint?.name.split(' ')[0]}
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm text-muted-foreground">查看指定日期:</label>
        <input
          type="date"
          onChange={handleDateChange}
          className="border rounded px-2 py-1 h-9"
          max={dayjs().format('YYYY-MM-DD')}
        />
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">{year}年金价趋势</h2>
        <PriceChart data={chartData} onPointClick={handlePointClick} />
      </div>
    </div>
  )
}

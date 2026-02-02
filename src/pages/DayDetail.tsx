import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import dayjs from 'dayjs'
import { useDailyData } from '../hooks/useGoldPrice'
import { PriceChart } from '../components/PriceChart'

export default function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { data, loading, error } = useDailyData(date || '')

  if (!date) {
    return <div className="p-4">无效日期</div>
  }

  const prevDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')
  const nextDate = dayjs(date).add(1, 'day').format('YYYY-MM-DD')
  const isToday = dayjs(date).isSame(dayjs(), 'day')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
        <p className="text-red-500">该日期暂无数据</p>
      </div>
    )
  }

  const chartData = data?.daily?.resultData?.datas || []
  const latestData = data?.latest?.resultData?.datas || {}

  const prices = chartData.map((item: any) => parseFloat(item.value[1]))
  const openPrice = prices[0] || 0
  const closePrice = prices[prices.length - 1] || 0
  const highPrice = Math.max(...prices)
  const lowPrice = Math.min(...prices)

  const change = parseFloat(latestData.upAndDownAmt) || (closePrice - openPrice)
  const changeRate = latestData.upAndDownRate || `${((change / openPrice) * 100).toFixed(2)}%`
  const isUp = change >= 0

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </button>

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{date}</h1>
          <p className="text-muted-foreground">金价详情</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/day/${prevDate}`)}
            className="p-2 border rounded hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/day/${nextDate}`)}
            disabled={isToday}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">开盘价</p>
          <p className="text-lg font-semibold">¥{openPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">收盘价</p>
          <p className="text-lg font-semibold">¥{closePrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">最高价</p>
          <p className="text-lg font-semibold text-red-500">¥{highPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">最低价</p>
          <p className="text-lg font-semibold text-green-500">¥{lowPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">¥{closePrice.toFixed(2)}</span>
          <span className={`flex items-center gap-1 ${isUp ? 'text-red-500' : 'text-green-500'}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {isUp ? '+' : ''}{change.toFixed(2)} ({changeRate})
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">当日金价走势</h2>
        <PriceChart data={chartData} />
      </div>
    </div>
  )
}

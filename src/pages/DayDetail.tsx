import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useDailyData, useAvailableDates } from '../hooks/useGoldPrice'
import { PriceChart } from '../components/PriceChart'

export default function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { data, loading, error } = useDailyData(date || '')
  const { dates: availableDates } = useAvailableDates()

  if (!date) {
    return <div className="p-4">无效日期</div>
  }

  // 找到当前日期在可用日期列表中的索引
  const sortedDates = [...availableDates].sort()
  const currentIndex = sortedDates.indexOf(date)

  const hasPrevDate = currentIndex > 0 ||
    (currentIndex === -1 && sortedDates.some(d => d < date))
  const hasNextDate = (currentIndex !== -1 && currentIndex < sortedDates.length - 1) ||
    (currentIndex === -1 && sortedDates.some(d => d > date))

  const handlePrevDate = () => {
    if (currentIndex > 0) {
      navigate(`/day/${sortedDates[currentIndex - 1]}`)
    } else if (currentIndex === -1) {
      const prevDates = sortedDates.filter(d => d < date)
      if (prevDates.length > 0) {
        navigate(`/day/${prevDates[prevDates.length - 1]}`)
      }
    }
  }

  const handleNextDate = () => {
    if (currentIndex !== -1 && currentIndex < sortedDates.length - 1) {
      navigate(`/day/${sortedDates[currentIndex + 1]}`)
    } else if (currentIndex === -1) {
      const nextDates = sortedDates.filter(d => d > date)
      if (nextDates.length > 0) {
        navigate(`/day/${nextDates[0]}`)
      }
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

  // 计算当日统计数据
  const prices = chartData.map((item: any) => parseFloat(item.value[1]))
  const openPrice = prices[0] || 0
  const closePrice = prices[prices.length - 1] || 0
  const highPrice = prices.length > 0 ? Math.max(...prices) : 0
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0

  // 当日涨跌（相对昨收）
  const yesterdayPrice = parseFloat(latestData.yesterdayPrice) || openPrice
  const currentPrice = parseFloat(latestData.price) || closePrice
  const dayChange = parseFloat(latestData.upAndDownAmt) || (currentPrice - yesterdayPrice)
  const dayChangeRate = latestData.upAndDownRate || `${((dayChange / yesterdayPrice) * 100).toFixed(2)}%`
  const isUp = dayChange >= 0

  // 当日振幅
  const amplitude = yesterdayPrice ? (((highPrice - lowPrice) / yesterdayPrice) * 100).toFixed(2) : '0'

  // 找出最高/最低价对应的时间
  const highIndex = prices.indexOf(highPrice)
  const lowIndex = prices.indexOf(lowPrice)
  const highTime = chartData[highIndex]?.name?.split(' ')[1]?.substring(0, 5) || ''
  const lowTime = chartData[lowIndex]?.name?.split(' ')[1]?.substring(0, 5) || ''

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
          <p className="text-muted-foreground">当日金价详情</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevDate}
            disabled={!hasPrevDate}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextDate}
            disabled={!hasNextDate}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 核心数据卡片 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">当前价格</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">¥{currentPrice.toFixed(2)}</span>
              <span className={`flex items-center gap-1 text-sm ${isUp ? 'text-red-500' : 'text-green-500'}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isUp ? '+' : ''}{dayChange.toFixed(2)} ({dayChangeRate})
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">昨日收盘</p>
            <p className="text-xl font-semibold">¥{yesterdayPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* 统计指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">开盘价</p>
            <p className="text-lg font-semibold">¥{openPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">最新价</p>
            <p className="text-lg font-semibold">¥{closePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">最高价</p>
            <p className="text-lg font-semibold text-red-500">¥{highPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{highTime}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">最低价</p>
            <p className="text-lg font-semibold text-green-500">¥{lowPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{lowTime}</p>
          </div>
        </div>

        {/* 额外指标 */}
        <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">当日振幅</p>
            <p className="text-lg font-semibold">{amplitude}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">价差</p>
            <p className="text-lg font-semibold">¥{(highPrice - lowPrice).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">数据点数</p>
            <p className="text-lg font-semibold">{chartData.length}</p>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">当日分时走势</h2>
        <PriceChart data={chartData} mode="daily" />
      </div>
    </div>
  )
}

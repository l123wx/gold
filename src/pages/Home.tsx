import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import dayjs from 'dayjs'
import { useYearlyData, useAvailableDates } from '../hooks/useGoldPrice'
import { PriceChart } from '../components/PriceChart'
import 'react-day-picker/style.css'

interface YearlyDataItem {
  price: string
  time: string
}

export default function Home() {
  const navigate = useNavigate()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'))
  const { data, loading, error } = useYearlyData(selectedYear)
  const { dates: availableDates, loading: datesLoading } = useAvailableDates()

  // 从可用日期中提取有数据的年份
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    availableDates.forEach(date => {
      const year = date.split('-')[0]
      if (year) years.add(year)
    })
    return Array.from(years).sort()
  }, [availableDates])

  const currentYearIndex = availableYears.indexOf(selectedYear)
  const hasPrevYear = currentYearIndex > 0 ||
    (currentYearIndex === -1 && availableYears.some(y => y < selectedYear))
  const hasNextYear = (currentYearIndex !== -1 && currentYearIndex < availableYears.length - 1) ||
    (currentYearIndex === -1 && availableYears.some(y => y > selectedYear))

  const handlePrevYear = () => {
    if (currentYearIndex > 0) {
      setSelectedYear(availableYears[currentYearIndex - 1])
    } else if (currentYearIndex === -1) {
      const prevYears = availableYears.filter(y => y < selectedYear)
      if (prevYears.length > 0) {
        setSelectedYear(prevYears[prevYears.length - 1])
      }
    }
  }

  const handleNextYear = () => {
    if (currentYearIndex !== -1 && currentYearIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentYearIndex + 1])
    } else if (currentYearIndex === -1) {
      const nextYears = availableYears.filter(y => y > selectedYear)
      if (nextYears.length > 0) {
        setSelectedYear(nextYears[0])
      }
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setIsCalendarOpen(false)
      navigate(`/day/${dayjs(date).format('YYYY-MM-DD')}`)
    }
  }

  const availableDateSet = new Set(availableDates)
  const isDateDisabled = (date: Date) => {
    if (datesLoading) return false
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    return !availableDateSet.has(dateStr)
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

  // 年度数据格式转换
  const rawData: YearlyDataItem[] = data?.resultData?.datas || []
  const chartData = rawData.map((item: YearlyDataItem) => {
    const date = dayjs(parseInt(item.time)).format('YYYY-MM-DD')
    return {
      name: date,
      value: [date, item.price] as [string, string]
    }
  })

  // 计算年度统计数据
  const prices = chartData.map(item => parseFloat(item.value[1]))
  const firstPrice = prices[0] || 0
  const latestPrice = prices[prices.length - 1] || 0
  const highPrice = prices.length > 0 ? Math.max(...prices) : 0
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0
  const yearChange = latestPrice - firstPrice
  const yearChangeRate = firstPrice ? ((yearChange / firstPrice) * 100).toFixed(2) : '0'
  const amplitude = firstPrice ? (((highPrice - lowPrice) / firstPrice) * 100).toFixed(2) : '0'
  const isUp = yearChange >= 0

  // 找出最高/最低价对应的日期
  const highIndex = prices.indexOf(highPrice)
  const lowIndex = prices.indexOf(lowPrice)
  const highDate = chartData[highIndex]?.name || ''
  const lowDate = chartData[lowIndex]?.name || ''

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">金价走势</h1>
        <p className="text-muted-foreground">{selectedYear}年数据概览</p>
      </header>

      {/* 核心数据卡片 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">最新价格</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">¥{latestPrice.toFixed(2)}</span>
              <span className={`flex items-center gap-1 text-sm ${isUp ? 'text-red-500' : 'text-green-500'}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isUp ? '+' : ''}{yearChange.toFixed(2)} ({isUp ? '+' : ''}{yearChangeRate}%)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">年初价格</p>
            <p className="text-xl font-semibold">¥{firstPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* 统计指标 */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">年度最高</p>
            <p className="text-lg font-semibold text-red-500">¥{highPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{highDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">年度最低</p>
            <p className="text-lg font-semibold text-green-500">¥{lowPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{lowDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">年度振幅</p>
            <p className="text-lg font-semibold">{amplitude}%</p>
            <p className="text-xs text-muted-foreground">¥{(highPrice - lowPrice).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 日期选择器 */}
      <div className="mb-4 relative">
        <label className="text-sm text-muted-foreground mr-2">查看指定日期:</label>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="border rounded px-3 py-1 h-9 inline-flex items-center gap-2 hover:bg-gray-50"
        >
          <Calendar className="w-4 h-4" />
          选择日期
        </button>
        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 p-2">
            <DayPicker
              mode="single"
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              defaultMonth={new Date()}
            />
          </div>
        )}
      </div>

      {/* 图表 */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{selectedYear}年金价趋势</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevYear}
              disabled={!hasPrevYear || datesLoading}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
              {selectedYear}
            </span>
            <button
              onClick={handleNextYear}
              disabled={!hasNextYear || datesLoading}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <PriceChart data={chartData} />
      </div>
    </div>
  )
}

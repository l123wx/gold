import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react'
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
  const year = dayjs().format('YYYY')
  const { data, loading, error } = useYearlyData(year)
  const { dates: availableDates, loading: datesLoading } = useAvailableDates()

  const handlePointClick = (date: string) => {
    navigate(`/day/${date}`)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setIsCalendarOpen(false)
      navigate(`/day/${dayjs(date).format('YYYY-MM-DD')}`)
    }
  }

  // 将可用日期转换为 Date 对象集合
  const availableDateSet = new Set(availableDates)

  // 禁用没有数据的日期（如果索引还在加载则不禁用任何日期）
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

  // 年度数据格式: { price, time } - 需要转换为图表格式
  const rawData: YearlyDataItem[] = data?.resultData?.datas || []
  const chartData = rawData.map((item: YearlyDataItem) => {
    const date = dayjs(parseInt(item.time)).format('YYYY-MM-DD')
    return {
      name: date,
      value: [date, item.price] as [string, string]
    }
  })

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

      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">{year}年金价趋势</h2>
        <PriceChart data={chartData} onPointClick={handlePointClick} />
      </div>
    </div>
  )
}

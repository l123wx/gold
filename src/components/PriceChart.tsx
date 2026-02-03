import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface PriceChartProps {
  data: Array<{ name: string; value: [string, string] }>
  onPointClick?: (date: string) => void
  mode?: 'yearly' | 'daily'
}

export function PriceChart({ data, onPointClick, mode = 'yearly' }: PriceChartProps) {
  const isDaily = mode === 'daily'

  // 提取显示用的标签和价格
  const labels = data.map(item => {
    if (isDaily) {
      // 每日模式：显示时间 HH:mm
      const timePart = item.name.split(' ')[1] || ''
      return timePart.substring(0, 5) // "09:06:00" -> "09:06"
    } else {
      // 年度模式：显示日期 MM/DD
      const datePart = item.name.split(' ')[0]
      const parts = datePart.split('-')
      return `${parts[1]}/${parts[2]}`
    }
  })

  const prices = data.map(item => parseFloat(item.value[1]))

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0]
        const index = point.dataIndex
        const price = prices[index]
        const originalName = data[index]?.name || ''
        return `${originalName}<br/>金价: ¥${price.toFixed(2)}`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: prices,
        areaStyle: {
          opacity: 0.1,
        },
        lineStyle: {
          color: '#f59e0b',
        },
        itemStyle: {
          color: '#f59e0b',
        },
      },
    ],
  }

  const handleClick = (params: any) => {
    if (onPointClick && params.dataIndex !== undefined) {
      const date = data[params.dataIndex].name.split(' ')[0]
      onPointClick(date)
    }
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
      onEvents={{ click: handleClick }}
    />
  )
}

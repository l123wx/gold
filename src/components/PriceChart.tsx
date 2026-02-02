import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface PriceChartProps {
  data: Array<{ name: string; value: [string, string] }>
  onPointClick?: (date: string) => void
}

export function PriceChart({ data, onPointClick }: PriceChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0]
        return `${point.name}<br/>金价: ¥${point.value[1]}`
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
      data: data.map(item => item.name.split(' ')[0]),
      axisLabel: {
        formatter: (value: string) => {
          const parts = value.split('-')
          return `${parts[1]}/${parts[2]}`
        },
      },
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
        data: data.map(item => parseFloat(item.value[1])),
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

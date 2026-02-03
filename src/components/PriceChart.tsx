import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface PriceChartProps {
  data: Array<{ name: string; value: [string, string] }>
  mode?: 'yearly' | 'daily'
}

export function PriceChart({ data, mode = 'yearly' }: PriceChartProps) {
  const isDaily = mode === 'daily'

  // 转换数据为时间轴格式
  const seriesData = data.map(item => {
    const timeStr = item.value[0]
    const price = parseFloat(item.value[1])

    let time: number
    if (isDaily) {
      // 每日模式：解析完整时间字符串
      time = new Date(item.name).getTime()
    } else {
      // 年度模式：解析日期
      time = new Date(timeStr).getTime()
    }

    return [time, price] as [number, number]
  }).filter(item => !isNaN(item[0]) && !isNaN(item[1]))

  // 按时间排序
  seriesData.sort((a, b) => a[0] - b[0])

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0]
        const time = new Date(point.value[0])
        const price = point.value[1]

        if (isDaily) {
          const formattedTime = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
          return `${formattedTime}<br/>金价: <b>¥${price.toFixed(2)}</b>`
        } else {
          const formattedDate = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`
          return `${formattedDate}<br/>金价: <b>¥${price.toFixed(2)}</b>`
        }
      },
      axisPointer: {
        animation: false
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: isDaily ? '15%' : '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: (value: number) => {
          const date = new Date(value)
          if (isDaily) {
            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
          } else {
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        }
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    dataZoom: isDaily ? [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        filterMode: 'filter',
        start: 0,
        end: 100,
        bottom: 10,
        height: 20,
        borderColor: 'transparent',
        backgroundColor: 'rgba(180, 180, 180, 0.1)',
        dataBackground: {
          lineStyle: {
            color: '#f59e0b'
          },
          areaStyle: {
            color: 'rgba(245, 158, 11, 0.3)'
          }
        },
        fillerColor: 'rgba(245, 158, 11, 0.2)',
        handleStyle: {
          color: '#f59e0b'
        },
        textStyle: {
          color: '#333'
        }
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      }
    ] : undefined,
    series: [
      {
        name: '金价',
        type: 'line',
        smooth: false,
        showSymbol: false,
        emphasis: {
          scale: true
        },
        data: seriesData,
        areaStyle: {
          opacity: 0.1,
        },
        lineStyle: {
          color: '#f59e0b',
        },
        itemStyle: {
          color: '#f59e0b',
        },
        markPoint: {
          data: [
            {
              type: 'max',
              name: '最高',
              itemStyle: {
                color: 'rgba(239, 68, 68, 0.6)',
              },
              label: {
                color: '#000',
                fontWeight: 'bold',
                formatter: (params: any) => `最高 ¥${params.value.toFixed(2)}`
              }
            },
            {
              type: 'min',
              name: '最低',
              itemStyle: {
                color: 'rgba(34, 197, 94, 0.6)',
              },
              label: {
                color: '#000',
                fontWeight: 'bold',
                formatter: (params: any) => `最低 ¥${params.value.toFixed(2)}`
              }
            }
          ]
        },
        markLine: {
          silent: true,
          lineStyle: {
            type: 'dashed'
          },
          data: [
            {
              type: 'average',
              name: '平均',
              label: {
                formatter: '平均 ¥{c}'
              }
            }
          ]
        }
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

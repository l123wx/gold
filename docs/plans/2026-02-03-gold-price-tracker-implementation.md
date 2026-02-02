# 金价信息记录网站实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个自动记录每日金价的网站，通过 GitHub Actions 获取数据，前端展示年度趋势和每日详情。

**Architecture:** React SPA 通过 GitHub raw URL 读取 JSON 数据，ECharts 渲染图表。GitHub Actions 定时执行脚本获取京东金融 API 数据并提交到仓库。

**Tech Stack:** React + TypeScript + Vite, TailwindCSS, @coss/ui, ECharts, React Router, Lucide React

---

## Task 1: 初始化 React + Vite 项目

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`
- Create: `.gitignore`

**Step 1: 使用 Vite 创建项目**

Run:
```bash
cd /Users/elvis/Files/Projects/gold
pnpm create vite . --template react-ts
```

如果提示目录非空，选择忽略现有文件继续。

**Step 2: 安装依赖**

Run:
```bash
pnpm install
```

**Step 3: 验证项目运行**

Run:
```bash
pnpm dev
```

Expected: 浏览器打开 http://localhost:5173 显示 Vite + React 页面

**Step 4: 提交**

```bash
git add .
git commit -m "feat: 初始化 React + Vite 项目"
```

---

## Task 2: 配置 TailwindCSS

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Modify: `src/index.css`

**Step 1: 安装 TailwindCSS**

Run:
```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm tailwindcss init -p
```

**Step 2: 配置 tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        muted: {
          foreground: 'var(--color-muted-foreground)',
        },
      },
    },
  },
  plugins: [],
}
```

**Step 3: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #1a1a1a;
  --color-accent: #f59e0b;
  --color-muted-foreground: #6b7280;
}

body {
  @apply bg-white text-primary;
}
```

**Step 4: 在 main.tsx 中导入 CSS**

确保 `src/main.tsx` 导入:
```tsx
import './index.css'
```

**Step 5: 验证 TailwindCSS 生效**

修改 App.tsx 添加一个 Tailwind 类名测试:
```tsx
<h1 className="text-2xl font-bold text-accent">金价信息</h1>
```

Run:
```bash
pnpm dev
```

Expected: 标题显示为金黄色

**Step 6: 提交**

```bash
git add .
git commit -m "feat: 配置 TailwindCSS"
```

---

## Task 3: 安装核心依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装 React Router**

Run:
```bash
pnpm add react-router-dom
```

**Step 2: 安装 ECharts**

Run:
```bash
pnpm add echarts echarts-for-react
```

**Step 3: 安装 Lucide React**

Run:
```bash
pnpm add lucide-react
```

**Step 4: 安装日期处理库**

Run:
```bash
pnpm add dayjs
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat: 安装核心依赖 (react-router, echarts, lucide, dayjs)"
```

---

## Task 4: 配置 React Router

**Files:**
- Create: `src/router/index.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/DayDetail.tsx`

**Step 1: 创建路由配置 src/router/index.tsx**

```tsx
import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import DayDetail from '../pages/DayDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/day/:date',
    element: <DayDetail />,
  },
], {
  basename: import.meta.env.BASE_URL,
})
```

**Step 2: 创建占位首页 src/pages/Home.tsx**

```tsx
export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">金价信息</h1>
      <p className="text-muted-foreground">年度趋势图</p>
    </div>
  )
}
```

**Step 3: 创建占位详情页 src/pages/DayDetail.tsx**

```tsx
import { useParams } from 'react-router-dom'

export default function DayDetail() {
  const { date } = useParams<{ date: string }>()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{date} 金价详情</h1>
    </div>
  )
}
```

**Step 4: 修改 src/App.tsx 使用路由**

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  return <RouterProvider router={router} />
}

export default App
```

**Step 5: 验证路由工作**

Run:
```bash
pnpm dev
```

Expected:
- 访问 `/` 显示首页
- 访问 `/day/2025-04-21` 显示详情页

**Step 6: 提交**

```bash
git add .
git commit -m "feat: 配置 React Router 和页面骨架"
```

---

## Task 5: 创建数据获取脚本

**Files:**
- Create: `scripts/fetch-price.ts`
- Modify: `package.json` (添加脚本依赖)

**Step 1: 安装脚本依赖**

Run:
```bash
pnpm add -D tsx
```

**Step 2: 创建 scripts/fetch-price.ts**

```typescript
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
```

**Step 3: 添加 npm 脚本**

在 package.json 的 scripts 中添加:
```json
"fetch-price": "tsx scripts/fetch-price.ts"
```

**Step 4: 测试脚本执行**

Run:
```bash
pnpm fetch-price
```

Expected: 在 `data/` 目录下生成 JSON 文件

**Step 5: 提交**

```bash
git add .
git commit -m "feat: 创建金价数据获取脚本"
```

---

## Task 6: 创建 GitHub Actions 工作流

**Files:**
- Create: `.github/workflows/fetch-price.yml`
- Create: `.github/workflows/deploy.yml`

**Step 1: 创建数据获取工作流 .github/workflows/fetch-price.yml**

```yaml
name: Fetch Gold Price

on:
  schedule:
    - cron: '55 15 * * *'
    - cron: '57 15 * * *'
    - cron: '59 15 * * *'
  workflow_dispatch:

env:
  TZ: Asia/Shanghai

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Fetch gold price
        run: pnpm fetch-price

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          git diff --staged --quiet || git commit -m "chore: 更新金价数据"
          git push
```

**Step 2: 创建部署工作流 .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master
    paths-ignore:
      - 'data/**'

env:
  TZ: Asia/Shanghai

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    permissions:
      pages: write
      id-token: write

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 3: 配置 vite.config.ts 的 base**

修改 `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
})
```

**Step 4: 提交**

```bash
git add .
git commit -m "ci: 添加 GitHub Actions 工作流"
```

---

## Task 7: 创建数据获取 Hook

**Files:**
- Create: `src/hooks/useGoldPrice.ts`
- Create: `src/lib/api.ts`

**Step 1: 创建 API 工具 src/lib/api.ts**

```typescript
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
```

**Step 2: 创建 Hook src/hooks/useGoldPrice.ts**

```typescript
import { useState, useEffect } from 'react'
import { fetchYearlyData, fetchDailyData, fetchLatestPrice } from '../lib/api'

export function useYearlyData(year: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchYearlyData(year)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [year])

  return { data, loading, error }
}

export function useDailyData(date: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDailyData(date), fetchLatestPrice(date)])
      .then(([daily, latest]) => setData({ daily, latest }))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [date])

  return { data, loading, error }
}
```

**Step 3: 提交**

```bash
git add .
git commit -m "feat: 创建数据获取 API 和 Hook"
```

---

## Task 8: 创建 ECharts 图表组件

**Files:**
- Create: `src/components/PriceChart.tsx`

**Step 1: 创建 src/components/PriceChart.tsx**

```tsx
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
```

**Step 2: 提交**

```bash
git add .
git commit -m "feat: 创建 ECharts 图表组件"
```

---

## Task 9: 实现首页

**Files:**
- Modify: `src/pages/Home.tsx`

**Step 1: 实现首页 src/pages/Home.tsx**

```tsx
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
```

**Step 2: 验证首页展示**

Run:
```bash
pnpm dev
```

Expected: 首页展示年度趋势图（需要先运行 fetch-price 获取数据）

**Step 3: 提交**

```bash
git add .
git commit -m "feat: 实现首页年度趋势展示"
```

---

## Task 10: 实现详情页

**Files:**
- Modify: `src/pages/DayDetail.tsx`

**Step 1: 实现详情页 src/pages/DayDetail.tsx**

```tsx
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
```

**Step 2: 验证详情页展示**

Run:
```bash
pnpm dev
```

访问 `/day/2026-02-03`（或有数据的日期）

Expected: 详情页展示当日金价走势

**Step 3: 提交**

```bash
git add .
git commit -m "feat: 实现详情页金价展示"
```

---

## Task 11: 最终验证和部署

**Step 1: 本地构建测试**

Run:
```bash
pnpm build
pnpm preview
```

Expected: 预览构建产物正常工作

**Step 2: 推送代码触发部署**

```bash
git push
```

**Step 3: 在 GitHub 仓库设置中启用 GitHub Pages**

1. 进入仓库 Settings > Pages
2. Source 选择 "GitHub Actions"

**Step 4: 手动触发数据获取**

1. 进入仓库 Actions 页面
2. 选择 "Fetch Gold Price" 工作流
3. 点击 "Run workflow"

**Step 5: 验证网站部署**

Expected: 访问 `https://l123wx.github.io/gold/` 正常展示

---

## 完成

所有任务完成后，项目将具备：
- 自动每日获取金价数据
- 年度趋势图展示
- 每日详情页展示
- 自动部署到 GitHub Pages
